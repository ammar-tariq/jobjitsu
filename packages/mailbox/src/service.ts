import {
  isApplicationLifecycleStatus,
  resolveApplicationView,
  updateApplicationDraft,
  type Application,
  type ApplicationRepository,
  type ApplicationUserOverrides,
} from "@jobjitsu/applications";
import type { EventBus } from "@jobjitsu/events";
import type { ApplicationId } from "@jobjitsu/shared";
import { lookbackCutoff, messageTimestamp } from "./fixtures.js";
import {
  applicationFunnel,
  computeAnalytics,
  detectDuplicatePairs,
  detectNoResponseApplications,
  followUpRecommendation,
  listOpenActions,
  silentDays,
  summarizeApplications,
} from "./intelligence.js";
import { ingestProviderMessage, processUnprocessedEmails } from "./process.js";
import { createFakeMailboxProvider } from "./providers/fake.js";
import { createGmailMailboxProvider } from "./providers/gmail.js";
import { createOutlookMailboxProvider } from "./providers/outlook.js";
import type { MailboxProvider } from "./providers/types.js";
import { listDocs, newLocalId, readDoc, type MailboxStore } from "./store.js";
import type {
  MailboxAction,
  MailboxAiPort,
  MailboxAnalytics,
  MailboxDashboardSummary,
  MailboxDuplicatePair,
  MailboxEmail,
  MailboxFunnel,
  MailboxIntegration,
  MailboxOAuthTokens,
  MailboxProviderId,
  MailboxSettings,
  MailboxTimelineEvent,
} from "./types.js";

const PAGE_SIZE = 25;

export type MailboxService = {
  listIntegrations(): Promise<readonly MailboxIntegration[]>;
  getSettings(): Promise<MailboxSettings>;
  updateSettings(patch: Partial<MailboxSettings>): Promise<MailboxSettings>;
  connectSampleMailbox(): Promise<MailboxIntegration>;
  connectProvider(input: {
    readonly provider: "gmail" | "outlook";
    readonly tokens: MailboxOAuthTokens;
    readonly emailAddress?: string;
    readonly label?: string;
  }): Promise<MailboxIntegration>;
  beginProviderConnect(provider: "gmail" | "outlook"): Promise<{
    readonly status: "needs_client_id" | "needs_consent";
    readonly message: string;
  }>;
  sync(integrationId: string): Promise<MailboxIntegration>;
  getIntegration(id: string): Promise<MailboxIntegration | undefined>;
  disconnect(integrationId: string): Promise<MailboxIntegration | undefined>;
  deleteImportedData(integrationId: string): Promise<void>;
  dashboard(): Promise<{
    readonly summary: MailboxDashboardSummary;
    readonly funnel: MailboxFunnel;
    readonly actions: readonly MailboxAction[];
    readonly duplicates: readonly MailboxDuplicatePair[];
    readonly analytics: MailboxAnalytics;
    readonly integrations: readonly MailboxIntegration[];
  }>;
  listActions(): Promise<readonly MailboxAction[]>;
  completeAction(id: string): Promise<MailboxAction | undefined>;
  listTimeline(applicationId: string): Promise<readonly MailboxTimelineEvent[]>;
  listLinkedEmails(applicationId: string): Promise<readonly MailboxEmail[]>;
  getEmail(id: string): Promise<MailboxEmail | undefined>;
  mergeApplications(targetId: string, sourceId: string): Promise<Application | undefined>;
  archiveApplication(id: string): Promise<Application | undefined>;
  confirmMatch(emailId: string, applicationId: string): Promise<MailboxEmail | undefined>;
  keepSeparate(emailId: string): Promise<MailboxEmail | undefined>;
  overrideApplication(
    id: string,
    overrides: ApplicationUserOverrides,
  ): Promise<Application | undefined>;
  dismissDuplicatePair(leftId: string, rightId: string): Promise<MailboxSettings>;
  bindAi(port: MailboxAiPort): void;
  waitForSync(integrationId: string): Promise<MailboxIntegration>;
};

export type CreateMailboxServiceOptions = {
  readonly store: MailboxStore;
  readonly applications: ApplicationRepository;
  readonly bus?: EventBus;
  readonly ai?: MailboxAiPort;
  readonly now?: () => Date;
  readonly providers?: Partial<Record<MailboxProviderId, MailboxProvider>>;
};

export function createMailboxService(options: CreateMailboxServiceOptions): MailboxService {
  const { store, applications, bus, now } = options;
  let ai = options.ai;
  const running = new Map<string, Promise<void>>();

  function providerFor(integration: MailboxIntegration): MailboxProvider {
    if (options.providers?.[integration.provider]) {
      return options.providers[integration.provider] as MailboxProvider;
    }
    if (integration.provider === "gmail") {
      return createGmailMailboxProvider({
        getTokens: () => store.getTokens(integration.id),
      });
    }
    if (integration.provider === "outlook") {
      return createOutlookMailboxProvider({
        getTokens: () => store.getTokens(integration.id),
      });
    }
    return createFakeMailboxProvider();
  }

  async function putIntegration(integration: MailboxIntegration): Promise<MailboxIntegration> {
    await store.integrations.put(integration);
    return integration;
  }

  async function runSync(integration: MailboxIntegration): Promise<void> {
    const settings = await store.getSettings();
    const checkpoint = await store.getCheckpoint(integration.id);
    const lookback = lookbackCutoff(
      integration.lookbackDays || settings.lookbackDays,
      now?.() ?? new Date(),
    );
    const initialComplete = checkpoint?.initialComplete ?? false;
    const exclusiveSince = initialComplete;
    const since = initialComplete && checkpoint?.watermark ? checkpoint.watermark : lookback;
    let cursor = checkpoint?.pageCursor;
    let historyCursor = checkpoint?.historyCursor;
    let watermark = checkpoint?.watermark;
    let processedTotal = integration.emailsProcessed;
    let jobRelated = integration.jobRelatedCount;
    let applicationsFound = integration.applicationsFound;
    let totalEstimate = integration.emailsTotal;
    const provider = providerFor(integration);
    try {
      await putIntegration({
        ...integration,
        syncStatus: "syncing",
        syncError: undefined,
        updatedAt: new Date().toISOString(),
      });
      do {
        const page = await provider.listPage({
          cursor,
          since,
          historyCursor,
          pageSize: PAGE_SIZE,
          exclusiveSince,
        });
        totalEstimate = page.totalEstimate ?? totalEstimate;
        for (const message of page.messages) {
          await ingestProviderMessage(store, integration.id, integration.provider, message);
          const stamp = messageTimestamp(message);
          if (stamp && (!watermark || stamp > watermark)) {
            watermark = stamp;
          }
        }
        cursor = page.nextCursor;
        if (page.historyCursor) {
          historyCursor = page.historyCursor;
        }
        await store.putCheckpoint({
          id: integration.id,
          initialComplete,
          pageCursor: cursor,
          historyCursor,
          watermark,
          updatedAt: new Date().toISOString(),
        });
        await putIntegration({
          ...(await requireIntegration(integration.id)),
          emailsTotal: totalEstimate,
          syncStatus: "syncing",
          updatedAt: new Date().toISOString(),
        });
      } while (cursor);

      await putIntegration({
        ...(await requireIntegration(integration.id)),
        syncStatus: "processing",
        updatedAt: new Date().toISOString(),
      });

      let pending = (await store.unprocessedEmails()).filter(
        (email) => email.integrationId === integration.id,
      );
      while (pending.length > 0) {
        const batch = await processUnprocessedEmails({ store, applications, bus, ai, now });
        processedTotal += batch.processed;
        jobRelated += batch.jobRelated;
        applicationsFound += batch.applicationsFound;
        await putIntegration({
          ...(await requireIntegration(integration.id)),
          emailsProcessed: processedTotal,
          jobRelatedCount: jobRelated,
          applicationsFound,
          syncStatus: "processing",
          updatedAt: new Date().toISOString(),
        });
        pending = (await store.unprocessedEmails()).filter(
          (email) => email.integrationId === integration.id,
        );
      }

      await markNoResponse();
      await store.putCheckpoint({
        id: integration.id,
        initialComplete: true,
        historyCursor,
        watermark,
        updatedAt: new Date().toISOString(),
      });
      await putIntegration({
        ...(await requireIntegration(integration.id)),
        emailsProcessed: processedTotal,
        jobRelatedCount: jobRelated,
        applicationsFound,
        lastSyncedAt: new Date().toISOString(),
        syncStatus: "idle",
        syncError: undefined,
        updatedAt: new Date().toISOString(),
      });
      if (bus) {
        await bus.publish("Email.Synced", {
          channelId: integration.id,
          messageCount: processedTotal,
        });
      }
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Mail sync paused. You can try again from Preferences.";
      const tokenExpired = /expired/i.test(message);
      await putIntegration({
        ...(await requireIntegration(integration.id)),
        syncStatus: tokenExpired ? "token_expired" : "failed",
        syncError: message,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async function requireIntegration(id: string): Promise<MailboxIntegration> {
    const row = await readDoc(store.integrations, id);
    if (!row) {
      throw new Error("That email connection is not on this device.");
    }
    return row;
  }

  async function markNoResponse(): Promise<void> {
    const settings = await store.getSettings();
    const listed = await applications.list();
    const silent = detectNoResponseApplications(listed, settings, now?.() ?? new Date());
    for (const application of silent) {
      if (application.userOverrides?.lifecycleStatus) {
        continue;
      }
      const days = silentDays(application, now?.() ?? new Date());
      await updateApplicationDraft({
        repository: applications,
        bus,
        patch: {
          id: application.id,
          lifecycleStatus: "no_response",
          nextAction: followUpRecommendation(application, days),
        },
      });
    }
  }

  async function startSync(integration: MailboxIntegration): Promise<MailboxIntegration> {
    if (!running.has(integration.id)) {
      const work = runSync(integration).finally(() => {
        running.delete(integration.id);
      });
      running.set(integration.id, work);
    }
    return {
      ...(await requireIntegration(integration.id)),
      syncStatus: "syncing",
    };
  }

  async function waitForSync(integrationId: string): Promise<MailboxIntegration> {
    await running.get(integrationId);
    return requireIntegration(integrationId);
  }

  return {
    async listIntegrations() {
      return listDocs(store.integrations);
    },
    getSettings: () => store.getSettings(),
    async updateSettings(patch) {
      const current = await store.getSettings();
      const next = { ...current, ...patch };
      await store.putSettings(next);
      return next;
    },
    async connectSampleMailbox() {
      const nowIso = new Date().toISOString();
      const integration: MailboxIntegration = {
        id: newLocalId("mbox"),
        provider: "fake",
        label: "Sample mailbox",
        emailAddress: "you@example.com",
        connected: true,
        connectedAt: nowIso,
        syncStatus: "idle",
        lookbackDays: (await store.getSettings()).lookbackDays,
        emailsProcessed: 0,
        jobRelatedCount: 0,
        applicationsFound: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      await putIntegration(integration);
      return startSync(integration);
    },
    async connectProvider(input) {
      const nowIso = new Date().toISOString();
      const integration: MailboxIntegration = {
        id: newLocalId("mbox"),
        provider: input.provider,
        label: input.label ?? (input.provider === "gmail" ? "Gmail" : "Outlook"),
        emailAddress: input.emailAddress,
        connected: true,
        connectedAt: nowIso,
        syncStatus: "idle",
        lookbackDays: (await store.getSettings()).lookbackDays,
        emailsProcessed: 0,
        jobRelatedCount: 0,
        applicationsFound: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      await store.putTokens(integration.id, input.tokens);
      await putIntegration(integration);
      return startSync(integration);
    },
    async beginProviderConnect(provider) {
      const settings = await store.getSettings();
      const clientId = provider === "gmail" ? settings.gmailClientId : settings.outlookClientId;
      if (!clientId) {
        return {
          status: "needs_client_id" as const,
          message:
            provider === "gmail"
              ? "Add a Gmail client ID in Preferences, then connect. JobJitsu never asks for your password."
              : "Add an Outlook client ID in Preferences, then connect. JobJitsu never asks for your password.",
        };
      }
      return {
        status: "needs_consent" as const,
        message:
          "Finish connecting in your browser. Access stays on this device. Nothing is sent from JobJitsu.",
      };
    },
    async sync(integrationId) {
      const integration = await requireIntegration(integrationId);
      return startSync(integration);
    },
    waitForSync,
    getIntegration: (id) => readDoc(store.integrations, id),
    async disconnect(integrationId) {
      const integration = await readDoc(store.integrations, integrationId);
      if (!integration) {
        return undefined;
      }
      await store.deleteTokens(integrationId);
      const next: MailboxIntegration = {
        ...integration,
        connected: false,
        syncStatus: "disconnected",
        updatedAt: new Date().toISOString(),
      };
      await putIntegration(next);
      return next;
    },
    async deleteImportedData(integrationId) {
      const emails = await listDocs(store.emails);
      for (const email of emails) {
        if (email.integrationId === integrationId) {
          await store.emails.delete(email.id);
        }
      }
      const actions = await listDocs(store.actions);
      for (const action of actions) {
        const email = action.emailId ? await readDoc(store.emails, action.emailId) : undefined;
        if (!email || email.integrationId === integrationId) {
          await store.actions.delete(action.id);
        }
      }
      await store.deleteTokens(integrationId);
      await store.deleteCheckpoint(integrationId);
      await store.integrations.delete(integrationId);
    },
    async dashboard() {
      const listed = await applications.list();
      const actions = await listOpenActions(store);
      const settings = await store.getSettings();
      const dismissed = new Set(settings.dismissedDuplicateKeys);
      return {
        summary: summarizeApplications(listed, actions),
        funnel: applicationFunnel(listed),
        actions,
        duplicates: detectDuplicatePairs(listed).filter(
          (pair) => !dismissed.has(duplicateKey(pair.leftId, pair.rightId)),
        ),
        analytics: computeAnalytics(listed, 30, now?.() ?? new Date()),
        integrations: await listDocs(store.integrations),
      };
    },
    listActions: () => listOpenActions(store),
    async completeAction(id) {
      const action = await readDoc(store.actions, id);
      if (!action) {
        return undefined;
      }
      const next: MailboxAction = {
        ...action,
        completed: true,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await store.actions.put(next);
      return next;
    },
    async listTimeline(applicationId) {
      const listed = await listDocs(store.timeline);
      return listed
        .filter((event) => event.applicationId === applicationId)
        .sort((a, b) => a.at.localeCompare(b.at));
    },
    async listLinkedEmails(applicationId) {
      const listed = await listDocs(store.emails);
      return listed.filter((email) => email.applicationId === applicationId);
    },
    getEmail: (id) => readDoc(store.emails, id),
    async mergeApplications(targetId, sourceId) {
      if (targetId === sourceId) {
        return applications.get(targetId as ApplicationId);
      }
      const target = await applications.get(targetId as ApplicationId);
      const source = await applications.get(sourceId as ApplicationId);
      if (!target || !source) {
        return undefined;
      }
      const emails = await listDocs(store.emails);
      const timeline = await listDocs(store.timeline);
      const actions = await listDocs(store.actions);
      for (const email of emails) {
        if (email.applicationId === source.id) {
          await store.emails.put({ ...email, applicationId: target.id, matchUncertain: false });
        }
      }
      for (const event of timeline) {
        if (event.applicationId === source.id) {
          await store.timeline.put({ ...event, applicationId: target.id });
        }
      }
      for (const action of actions) {
        if (action.applicationId === source.id) {
          await store.actions.put({ ...action, applicationId: target.id });
        }
      }
      await updateApplicationDraft({
        repository: applications,
        bus,
        patch: {
          id: target.id,
          linkedEmailIds: unique([
            ...(target.linkedEmailIds ?? []),
            ...(source.linkedEmailIds ?? []),
          ]),
          linkedThreadIds: unique([
            ...(target.linkedThreadIds ?? []),
            ...(source.linkedThreadIds ?? []),
          ]),
          lastActivityAt: maxStamp(target.lastActivityAt, source.lastActivityAt),
        },
      });
      await updateApplicationDraft({
        repository: applications,
        bus,
        patch: {
          id: source.id,
          archived: true,
          mergedIntoId: target.id,
        },
      });
      return applications.get(target.id);
    },
    async archiveApplication(id) {
      const existing = await applications.get(id as ApplicationId);
      if (!existing) {
        return undefined;
      }
      const result = await updateApplicationDraft({
        repository: applications,
        bus,
        patch: { id: existing.id, archived: true },
      });
      return result.application;
    },
    async confirmMatch(emailId, applicationId) {
      const email = await readDoc(store.emails, emailId);
      if (!email) {
        return undefined;
      }
      const next: MailboxEmail = {
        ...email,
        applicationId: applicationId as ApplicationId,
        matchUncertain: false,
        updatedAt: new Date().toISOString(),
      };
      await store.emails.put(next);
      const application = await applications.get(applicationId as ApplicationId);
      if (application) {
        await updateApplicationDraft({
          repository: applications,
          bus,
          patch: {
            id: application.id,
            linkedEmailIds: unique([...(application.linkedEmailIds ?? []), email.id]),
            linkedThreadIds: unique(
              [...(application.linkedThreadIds ?? []), email.threadId].filter(
                (value): value is string => Boolean(value),
              ),
            ),
          },
        });
      }
      return next;
    },
    async keepSeparate(emailId) {
      const email = await readDoc(store.emails, emailId);
      if (!email) {
        return undefined;
      }
      const next: MailboxEmail = {
        ...email,
        matchUncertain: false,
        updatedAt: new Date().toISOString(),
      };
      await store.emails.put(next);
      return next;
    },
    bindAi(port) {
      ai = port;
    },
    async dismissDuplicatePair(leftId, rightId) {
      const current = await store.getSettings();
      const key = duplicateKey(leftId, rightId);
      if (current.dismissedDuplicateKeys.includes(key)) {
        return current;
      }
      const next = {
        ...current,
        dismissedDuplicateKeys: [...current.dismissedDuplicateKeys, key],
      };
      await store.putSettings(next);
      return next;
    },
    async overrideApplication(id, overrides) {
      const existing = await applications.get(id as ApplicationId);
      if (!existing) {
        return undefined;
      }
      const merged: ApplicationUserOverrides = { ...existing.userOverrides, ...overrides };
      if (overrides.lifecycleStatus && !isApplicationLifecycleStatus(overrides.lifecycleStatus)) {
        throw new Error("That status is not recognized.");
      }
      const result = await updateApplicationDraft({
        repository: applications,
        bus,
        patch: {
          id: existing.id,
          userOverrides: merged,
          companyName: overrides.companyName ?? existing.companyName,
          roleTitle: overrides.roleTitle ?? existing.roleTitle,
          lifecycleStatus: overrides.lifecycleStatus ?? existing.lifecycleStatus,
          appliedAt: overrides.appliedAt ?? existing.appliedAt,
          recruiterName: overrides.recruiterName ?? existing.recruiterName,
          recruiterEmail: overrides.recruiterEmail ?? existing.recruiterEmail,
        },
      });
      return result.application;
    },
  };
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function duplicateKey(leftId: string, rightId: string): string {
  return [leftId, rightId].sort().join(":");
}

function maxStamp(left?: string, right?: string): string | undefined {
  if (!left) {
    return right;
  }
  if (!right) {
    return left;
  }
  return left >= right ? left : right;
}

export { resolveApplicationView };
