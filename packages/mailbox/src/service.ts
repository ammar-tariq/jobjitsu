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
import {
  createPkcePair,
  mergeMailboxOAuthClients,
  type MailboxConnectResult,
  type MailboxOAuthClientEnv,
  type MailboxOAuthLoopback,
} from "./oauth.js";
import { ingestProviderMessage, processUnprocessedEmails } from "./process.js";
import { createFakeMailboxProvider } from "./providers/fake.js";
import {
  buildGmailAuthUrl,
  createGmailMailboxProvider,
  exchangeGmailCode,
  readGmailAccountEmail,
} from "./providers/gmail.js";
import {
  buildOutlookAuthUrl,
  createOutlookMailboxProvider,
  exchangeOutlookCode,
  readOutlookAccountEmail,
} from "./providers/outlook.js";
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

function mailboxLog(message: string, detail?: Record<string, unknown>): void {
  if (detail) {
    console.info(`[mailbox] ${message}`, detail);
  } else {
    console.info(`[mailbox] ${message}`);
  }
}

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
  beginProviderConnect(provider: "gmail" | "outlook"): Promise<MailboxConnectResult>;
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
  readonly oauth?: MailboxOAuthLoopback;
  readonly oauthClients?: MailboxOAuthClientEnv;
  readonly fetchImpl?: typeof fetch;
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
        putTokens: (tokens) => store.putTokens(integration.id, tokens),
        getClientCredentials: async () => {
          const merged = mergeMailboxOAuthClients(await store.getSettings(), options.oauthClients);
          return {
            clientId: merged.gmailClientId,
            clientSecret: merged.gmailClientSecret,
          };
        },
        fetchImpl: options.fetchImpl,
      });
    }
    if (integration.provider === "outlook") {
      return createOutlookMailboxProvider({
        getTokens: () => store.getTokens(integration.id),
        putTokens: (tokens) => store.putTokens(integration.id, tokens),
        getClientCredentials: async () => {
          const merged = mergeMailboxOAuthClients(await store.getSettings(), options.oauthClients);
          return { clientId: merged.outlookClientId };
        },
        fetchImpl: options.fetchImpl,
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
    let ingestedTotal = integration.emailsIngested ?? 0;
    let pageIndex = 0;
    const provider = providerFor(integration);
    mailboxLog("sync start", {
      integrationId: integration.id,
      provider: integration.provider,
      since,
      initialComplete,
      exclusiveSince,
    });
    try {
      await putIntegration({
        ...integration,
        syncStatus: "syncing",
        syncError: undefined,
        updatedAt: new Date().toISOString(),
      });
      do {
        pageIndex += 1;
        const page = await provider.listPage({
          cursor,
          since,
          historyCursor,
          pageSize: PAGE_SIZE,
          exclusiveSince,
        });
        totalEstimate = page.totalEstimate ?? totalEstimate;
        let pageIngested = 0;
        for (const message of page.messages) {
          const result = await ingestProviderMessage(
            store,
            integration.id,
            integration.provider,
            message,
          );
          if (!result.duplicate || !result.email.processed) {
            pageIngested += 1;
          }
          const stamp = messageTimestamp(message);
          if (stamp && (!watermark || stamp > watermark)) {
            watermark = stamp;
          }
        }
        ingestedTotal += page.messages.length;
        cursor = page.nextCursor;
        if (page.historyCursor) {
          historyCursor = page.historyCursor;
        }
        mailboxLog("sync page", {
          page: pageIndex,
          fetched: page.messages.length,
          pageIngested,
          ingestedTotal,
          estimate: totalEstimate,
          hasNext: Boolean(cursor),
        });
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
          emailsIngested: ingestedTotal,
          syncStatus: "syncing",
          updatedAt: new Date().toISOString(),
        });
      } while (cursor);

      await putIntegration({
        ...(await requireIntegration(integration.id)),
        emailsIngested: ingestedTotal,
        syncStatus: "processing",
        updatedAt: new Date().toISOString(),
      });
      mailboxLog("sync classify start", { ingestedTotal, estimate: totalEstimate });

      let pending = (await store.unprocessedEmails()).filter(
        (email) => email.integrationId === integration.id,
      );
      while (pending.length > 0) {
        const batch = await processUnprocessedEmails({ store, applications, bus, ai, now });
        processedTotal += batch.processed;
        jobRelated += batch.jobRelated;
        applicationsFound += batch.applicationsFound;
        mailboxLog("sync classify batch", {
          processed: batch.processed,
          processedTotal,
          jobRelated,
          applicationsFound,
          pendingLeft: Math.max(0, pending.length - batch.processed),
        });
        await putIntegration({
          ...(await requireIntegration(integration.id)),
          emailsProcessed: processedTotal,
          emailsIngested: ingestedTotal,
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
        emailsIngested: ingestedTotal,
        jobRelatedCount: jobRelated,
        applicationsFound,
        lastSyncedAt: new Date().toISOString(),
        syncStatus: "idle",
        syncError: undefined,
        updatedAt: new Date().toISOString(),
      });
      mailboxLog("sync complete", {
        ingestedTotal,
        processedTotal,
        jobRelated,
        applicationsFound,
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
      mailboxLog("sync failed", { message });
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
    await putIntegration({
      ...integration,
      syncStatus: "syncing",
      syncError: undefined,
      updatedAt: new Date().toISOString(),
    });
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

  async function connectWithTokens(input: {
    readonly provider: "gmail" | "outlook";
    readonly tokens: MailboxOAuthTokens;
    readonly emailAddress?: string;
    readonly label?: string;
  }): Promise<MailboxIntegration> {
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
      emailsIngested: 0,
      jobRelatedCount: 0,
      applicationsFound: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    await store.putTokens(integration.id, input.tokens);
    await putIntegration(integration);
    return startSync(integration);
  }

  async function beginProviderConnect(
    provider: "gmail" | "outlook",
  ): Promise<MailboxConnectResult> {
    const settings = mergeMailboxOAuthClients(await store.getSettings(), options.oauthClients);
    const clientId = provider === "gmail" ? settings.gmailClientId : settings.outlookClientId;
    const label = provider === "gmail" ? "Gmail" : "Outlook";
    if (!clientId?.trim()) {
      return {
        status: "needs_client_id",
        message:
          provider === "gmail"
            ? "Add a Gmail client ID in a local .env, then reconnect. JobJitsu never asks for your password."
            : "Add an Outlook client ID in a local .env, then reconnect. JobJitsu never asks for your password.",
      };
    }
    if (!options.oauth) {
      return {
        status: "needs_desktop",
        message: `Open the JobJitsu desktop app to connect ${label}. Browser preview cannot finish sign-in.`,
      };
    }
    try {
      const pkce = await createPkcePair();
      const session = await options.oauth.start();
      const authUrl =
        provider === "gmail"
          ? buildGmailAuthUrl({
              clientId: clientId.trim(),
              redirectUri: session.redirectUri,
              state: pkce.state,
              codeChallenge: pkce.challenge,
            })
          : buildOutlookAuthUrl({
              clientId: clientId.trim(),
              redirectUri: session.redirectUri,
              state: pkce.state,
              codeChallenge: pkce.challenge,
            });
      await options.oauth.openUrl(authUrl);
      const callback = await options.oauth.waitForCode();
      if (callback.error === "access_denied" || callback.error === "cancelled") {
        return {
          status: "failed",
          message: `${label} sign-in was cancelled. You can try again when you are ready.`,
        };
      }
      if (callback.error || !callback.code) {
        return {
          status: "failed",
          message: `${label} could not finish connecting. Try again.`,
        };
      }
      if (callback.state && callback.state !== pkce.state) {
        return {
          status: "failed",
          message: `${label} could not finish connecting. Try again.`,
        };
      }
      const fetchImpl = options.fetchImpl;
      const tokens =
        provider === "gmail"
          ? await exchangeGmailCode({
              clientId: clientId.trim(),
              clientSecret: settings.gmailClientSecret,
              code: callback.code,
              redirectUri: session.redirectUri,
              codeVerifier: pkce.verifier,
              fetchImpl,
            })
          : await exchangeOutlookCode({
              clientId: clientId.trim(),
              code: callback.code,
              redirectUri: session.redirectUri,
              codeVerifier: pkce.verifier,
              fetchImpl,
            });
      let emailAddress: string | undefined;
      try {
        emailAddress =
          provider === "gmail"
            ? await readGmailAccountEmail(tokens.accessToken, fetchImpl ?? fetch)
            : await readOutlookAccountEmail(tokens.accessToken, fetchImpl ?? fetch);
      } catch {
        emailAddress = undefined;
      }
      await connectWithTokens({
        provider,
        tokens,
        emailAddress,
      });
      return {
        status: "connected",
        message: `${label} connected. Importing mail on this device — watch the progress below. Nothing is sent.`,
      };
    } catch (cause) {
      const raw = cause instanceof Error ? cause.message : "";
      if (/timed out|timeout/i.test(raw)) {
        return {
          status: "failed",
          message: `${label} sign-in timed out. You can try again when you are ready.`,
        };
      }
      return {
        status: "failed",
        message: raw || `${label} could not finish connecting. Try again.`,
      };
    }
  }

  return {
    async listIntegrations() {
      return listDocs(store.integrations);
    },
    async getSettings() {
      // Return store-only settings. Never surface .env OAuth clients/secrets to the UI.
      return store.getSettings();
    },
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
        emailsIngested: 0,
        jobRelatedCount: 0,
        applicationsFound: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      await putIntegration(integration);
      await startSync(integration);
      return waitForSync(integration.id);
    },
    async connectProvider(input) {
      return connectWithTokens(input);
    },
    beginProviderConnect,
    async sync(integrationId) {
      const integration = await requireIntegration(integrationId);
      await startSync(integration);
      return waitForSync(integrationId);
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
