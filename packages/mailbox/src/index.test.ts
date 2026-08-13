import { describe, expect, it } from "vitest";
import { createMemoryApplicationRepository } from "@jobjitsu/applications";
import { createInMemoryEventBus } from "@jobjitsu/events";
import { createMemoryKvStore } from "@jobjitsu/storage";
import { cheapJobRelatedFilter } from "./filter.js";
import { classifyEmailDeterministic } from "./classify.js";
import { parseClassificationJson } from "./schema.js";
import { scoreApplicationMatch } from "./match.js";
import { createMailboxStore, listDocs } from "./store.js";
import { createMailboxService } from "./service.js";
import { PACKAGE_NAME } from "./index.js";
import { SAMPLE_MAILBOX_MESSAGES } from "./fingerprint.js";
import { createPkcePair } from "./oauth.js";
import { createGmailMailboxProvider } from "./providers/gmail.js";
import { paginateMessages } from "./providers/types.js";
import type { Application } from "@jobjitsu/applications";

describe("@jobjitsu/mailbox", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/mailbox");
  });

  it("builds PKCE without Node Buffer (webview-safe)", async () => {
    const globalRecord = globalThis as typeof globalThis & { Buffer?: unknown };
    const originalBuffer = globalRecord.Buffer;
    Reflect.deleteProperty(globalRecord, "Buffer");
    try {
      const pair = await createPkcePair();
      expect(pair.verifier.length).toBeGreaterThan(20);
      expect(pair.challenge.length).toBeGreaterThan(20);
      expect(pair.state.length).toBeGreaterThan(10);
      expect(pair.verifier).not.toMatch(/[+/=]/);
      expect(pair.challenge).not.toMatch(/[+/=]/);
    } finally {
      if (originalBuffer !== undefined) {
        globalRecord.Buffer = originalBuffer;
      }
    }
  });

  it("ignores newsletters and receipts before Agent classification", () => {
    expect(
      cheapJobRelatedFilter({
        subject: "This week in JavaScript",
        senderEmail: "newsletter@techweekly.example",
        snippet: "Unsubscribe if you no longer wish to receive this newsletter.",
        bodyText: "View in browser. Manage preferences.",
      }).potentiallyJobRelated,
    ).toBe(false);

    expect(
      cheapJobRelatedFilter({
        subject: "Your receipt from Cloud Store",
        senderEmail: "receipts@store.example",
        snippet: "Payment received. Invoice #441.",
      }).potentiallyJobRelated,
    ).toBe(false);
  });

  it("classifies representative job emails without an LLM", () => {
    expect(
      classifyEmailDeterministic({
        subject: "Application for Senior React Native Engineer",
        senderEmail: "you@example.com",
        snippet: "I applied for Senior React Native Engineer at Acme.",
        direction: "outbound",
      }).classification,
    ).toBe("job_application");

    expect(
      classifyEmailDeterministic({
        subject: "Your application at Acme",
        senderEmail: "noreply@mail.greenhouse.io",
        snippet: "Thank you for applying. We have received your application.",
        bodyText:
          "Thank you for applying. We have received your application for Senior React Native Engineer at Acme Inc.",
        direction: "inbound",
      }).classification,
    ).toBe("application_confirmation");

    expect(
      classifyEmailDeterministic({
        subject: "Technical Assessment",
        senderEmail: "assessments@hackerrank.com",
        snippet: "You have been invited to complete a HackerRank assessment.",
        direction: "inbound",
      }).classification,
    ).toBe("assessment");

    expect(
      classifyEmailDeterministic({
        subject: "Interview with our engineering team",
        senderEmail: "jordan@acme.example",
        snippet: "Please select a time using the following link.",
        direction: "inbound",
      }).classification,
    ).toBe("interview_invitation");

    expect(
      classifyEmailDeterministic({
        subject: "Update on your application",
        senderEmail: "jobs@northwind.example",
        snippet: "We regret to inform you we will not be moving forward.",
        direction: "inbound",
      }).classification,
    ).toBe("rejection");

    expect(
      classifyEmailDeterministic({
        subject: "Offer letter — Platform Engineer",
        senderEmail: "offers@bright.example",
        snippet: "We are pleased to offer you the Platform Engineer role.",
        direction: "inbound",
      }).classification,
    ).toBe("offer");

    expect(
      classifyEmailDeterministic({
        subject: "Lunch tomorrow?",
        senderEmail: "friend@example.com",
        snippet: "Want to grab lunch?",
        direction: "inbound",
      }).classification,
    ).toBe("not_job_related");
  });

  it("rejects malformed Agent JSON", () => {
    expect(parseClassificationJson("not json")).toBeUndefined();
    expect(
      parseClassificationJson({ isJobRelated: true, classification: "NOPE", confidence: 0.9 }),
    ).toBeUndefined();
    expect(
      parseClassificationJson({
        isJobRelated: true,
        classification: "assessment",
        confidence: 0.94,
        company: "Acme Inc",
        jobTitle: "Senior React Native Engineer",
        requiresUserAction: true,
        actionType: "complete_assessment",
      })?.classification,
    ).toBe("assessment");
  });

  it("matches same company and role, and keeps different roles separate", () => {
    const acmeRn = application({
      companyName: "Acme",
      roleTitle: "Senior React Native Engineer",
      companyDomain: "acme.example",
      linkedThreadIds: ["thread-acme-rn"],
    });
    const acmeEm = application({
      companyName: "Acme",
      roleTitle: "Engineering Manager",
      companyDomain: "acme.example",
    });

    const threadMatch = scoreApplicationMatch(
      {
        threadId: "thread-acme-rn",
        senderEmail: "jordan@acme.example",
        company: "Acme",
        jobTitle: "Senior React Native Engineer",
        subject: "Interview",
      },
      acmeRn,
    );
    expect(threadMatch.score).toBeGreaterThanOrEqual(100);
    expect(threadMatch.uncertain).toBe(false);

    const otherRole = scoreApplicationMatch(
      {
        senderEmail: "jobs@acme.example",
        company: "Acme",
        jobTitle: "Engineering Manager",
        subject: "Application received — Engineering Manager",
      },
      acmeRn,
    );
    expect(otherRole.reasons).toContain("same-company-different-role");
    expect(otherRole.applicationId).toBeUndefined();

    const recruiterOnly = scoreApplicationMatch(
      {
        senderEmail: "pat@hirebridge.example",
        recruiterEmail: "pat@hirebridge.example",
        company: "Globex",
        jobTitle: "Mobile Engineer",
        subject: "Role at Globex",
      },
      {
        ...acmeRn,
        recruiterEmail: "pat@hirebridge.example",
      },
    );
    expect(recruiterOnly.reasons).toContain("recruiter-alone");
    expect(recruiterOnly.uncertain).toBe(true);

    const emMatch = scoreApplicationMatch(
      {
        senderEmail: "jobs@acme.example",
        company: "Acme",
        jobTitle: "Engineering Manager",
        subject: "Application received — Engineering Manager",
      },
      acmeEm,
    );
    expect(emMatch.score).toBeGreaterThanOrEqual(65);
  });

  it("syncs a sample mailbox, groups threads, and skips duplicate provider ids", async () => {
    const { service, applications } = createHarness();
    const connected = await service.connectSampleMailbox();
    const finished = await service.waitForSync(connected.id);

    expect(finished.syncStatus).toBe("idle");
    expect(finished.emailsProcessed).toBeGreaterThan(0);
    expect(finished.emailsIngested ?? 0).toBeGreaterThan(0);
    expect(finished.emailsTotal).toBeUndefined();

    const listed = await applications.list();
    const acmeRn = listed.filter(
      (app) =>
        app.companyName.toLowerCase().includes("acme") && /react native/i.test(app.roleTitle),
    );
    expect(acmeRn.length).toBeGreaterThanOrEqual(1);
    const timeline = await service.listTimeline(acmeRn[0]!.id);
    expect(timeline.length).toBeGreaterThanOrEqual(2);

    const emails = await service.listLinkedEmails(acmeRn[0]!.id);
    expect(emails.some((email) => email.classification === "assessment")).toBe(true);

    const again = await service.sync(connected.id);
    await service.waitForSync(again.id);
    const after = await service.listLinkedEmails(acmeRn[0]!.id);
    const ids = after.map((email) => email.providerMessageId);
    expect(new Set(ids).size).toBe(ids.length);

    const dashboard = await service.dashboard();
    expect(dashboard.summary.totalApplications).toBeGreaterThan(0);
    expect(dashboard.actions.length).toBeGreaterThan(0);
    expect(dashboard.summary.actionsRequired).toBe(dashboard.actions.length);
  });

  it("keeps user corrections after a later sync", async () => {
    const { service, applications } = createHarness();
    const connected = await service.connectSampleMailbox();
    await service.waitForSync(connected.id);
    const listed = await applications.list();
    const first = listed[0];
    expect(first).toBeTruthy();
    await service.overrideApplication(first!.id, {
      companyName: "Corrected Co",
      roleTitle: "Corrected Role",
    });
    await service.sync(connected.id);
    await service.waitForSync(connected.id);
    const updated = await applications.get(first!.id);
    expect(updated?.userOverrides?.companyName).toBe("Corrected Co");
    expect(updated?.userOverrides?.roleTitle).toBe("Corrected Role");
  });

  it("does not return OAuth tokens on integrations", async () => {
    const { service } = createHarness();
    const connected = await service.connectProvider({
      provider: "gmail",
      tokens: { accessToken: "secret-token", refreshToken: "refresh-secret" },
      emailAddress: "you@gmail.com",
    });
    const listed = await service.listIntegrations();
    const snapshot = JSON.stringify(listed);
    expect(snapshot).not.toContain("secret-token");
    expect(snapshot).not.toContain("refresh-secret");
    expect(connected.provider).toBe("gmail");
  });

  it("asks for a Gmail client ID before opening a browser", async () => {
    const { service } = createHarness();
    const result = await service.beginProviderConnect("gmail");
    expect(result.status).toBe("needs_client_id");
    expect(result.message).toMatch(/client ID/i);
    expect(result.message).toMatch(/never asks for your password/i);
  });

  it("explains the desktop app is required when loopback is missing", async () => {
    const { service } = createHarness();
    await service.updateSettings({ gmailClientId: "desktop.apps.googleusercontent.com" });
    const result = await service.beginProviderConnect("gmail");
    expect(result.status).toBe("needs_desktop");
    expect(result.message).toMatch(/desktop app/i);
  });

  it("connects Gmail from env clients without pasting Preferences fields", async () => {
    const applications = createMemoryApplicationRepository();
    const store = createMailboxStore(createMemoryKvStore());
    const opened: string[] = [];
    const service = createMailboxService({
      store,
      applications,
      oauthClients: {
        gmailClientId: "env.apps.googleusercontent.com",
        gmailClientSecret: "env-secret",
      },
      oauth: {
        async start() {
          return { redirectUri: "http://127.0.0.1:17342/oauth" };
        },
        async openUrl(url) {
          opened.push(url);
        },
        async waitForCode() {
          const state = new URL(opened[0] ?? "http://127.0.0.1").searchParams.get("state") ?? "";
          return { code: "auth-code", state };
        },
      },
      fetchImpl: async (input, init) => {
        const url = String(input);
        if (url.includes("oauth2.googleapis.com/token")) {
          expect(String(init?.body ?? "")).toContain("client_secret=env-secret");
          return jsonResponse({
            access_token: "access-from-google",
            refresh_token: "refresh-from-google",
            expires_in: 3600,
          });
        }
        if (url.includes("/users/me/profile")) {
          return jsonResponse({ emailAddress: "you@gmail.com" });
        }
        if (url.includes("/messages?")) {
          return jsonResponse({ messages: [], resultSizeEstimate: 0 });
        }
        return jsonResponse({});
      },
    });
    const shown = await service.getSettings();
    expect(shown.gmailClientId).toBeUndefined();
    expect((await store.getSettings()).gmailClientId).toBeUndefined();
    const result = await service.beginProviderConnect("gmail");
    expect(result.status).toBe("connected");
    expect(opened[0]).toContain("env.apps.googleusercontent.com");
    expect(JSON.stringify(result)).not.toContain("env-secret");
    expect(JSON.stringify(result)).not.toContain("access-from-google");
  });

  it("prefers saved store client ids over env for connect (not shown in getSettings)", async () => {
    const opened: string[] = [];
    const withOauth = createMailboxService({
      store: createMailboxStore(createMemoryKvStore()),
      applications: createMemoryApplicationRepository(),
      oauthClients: { gmailClientId: "env.apps.googleusercontent.com" },
      oauth: {
        async start() {
          return { redirectUri: "http://127.0.0.1:17342/oauth" };
        },
        async openUrl(url) {
          opened.push(url);
        },
        async waitForCode() {
          return { error: "cancelled" };
        },
      },
    });
    await withOauth.updateSettings({ gmailClientId: "prefs.apps.googleusercontent.com" });
    await withOauth.beginProviderConnect("gmail");
    expect(opened[0]).toContain("prefs.apps.googleusercontent.com");
    expect(opened[0]).not.toContain("env.apps.googleusercontent.com");
  });

  it("completes Gmail connect through a fake loopback without exposing tokens", async () => {
    const applications = createMemoryApplicationRepository();
    const store = createMailboxStore(createMemoryKvStore());
    const bus = createInMemoryEventBus();
    const opened: string[] = [];
    const service = createMailboxService({
      store,
      applications,
      bus,
      oauth: {
        async start() {
          return { redirectUri: "http://127.0.0.1:17342/oauth" };
        },
        async openUrl(url) {
          opened.push(url);
        },
        async waitForCode() {
          const state = new URL(opened[0] ?? "http://127.0.0.1").searchParams.get("state") ?? "";
          return { code: "auth-code", state };
        },
      },
      fetchImpl: async (input, init) => {
        const url = String(input);
        if (url.includes("oauth2.googleapis.com/token")) {
          const body = String(init?.body ?? "");
          expect(body).toContain("code=auth-code");
          expect(body).toContain("client_secret=desktop-secret");
          return jsonResponse({
            access_token: "access-from-google",
            refresh_token: "refresh-from-google",
            expires_in: 3600,
            token_type: "Bearer",
            scope: "https://www.googleapis.com/auth/gmail.readonly",
          });
        }
        if (url.includes("/users/me/profile")) {
          return jsonResponse({ emailAddress: "you@gmail.com", historyId: "1" });
        }
        if (url.includes("/messages?")) {
          return jsonResponse({ messages: [], resultSizeEstimate: 0 });
        }
        return jsonResponse({});
      },
    });
    await service.updateSettings({
      gmailClientId: "desktop.apps.googleusercontent.com",
      gmailClientSecret: "desktop-secret",
    });
    const result = await service.beginProviderConnect("gmail");
    expect(result.status).toBe("connected");
    expect(opened[0]).toContain("accounts.google.com/o/oauth2");
    expect(opened[0]).toContain("code_challenge");
    expect(opened[0]).toContain("gmail.readonly");
    const listed = await service.listIntegrations();
    const snapshot = JSON.stringify({ result, listed });
    expect(snapshot).not.toContain("access-from-google");
    expect(snapshot).not.toContain("refresh-from-google");
    expect(snapshot).not.toContain("desktop-secret");
    expect(listed[0]?.emailAddress).toBe("you@gmail.com");
    const tokens = await store.getTokens(listed[0]!.id);
    expect(tokens?.accessToken).toBe("access-from-google");
    expect(tokens?.refreshToken).toBe("refresh-from-google");
  });

  it("completes Outlook connect through a fake loopback without exposing tokens", async () => {
    const applications = createMemoryApplicationRepository();
    const store = createMailboxStore(createMemoryKvStore());
    const opened: string[] = [];
    const service = createMailboxService({
      store,
      applications,
      oauth: {
        async start() {
          return { redirectUri: "http://127.0.0.1:17342/oauth" };
        },
        async openUrl(url) {
          opened.push(url);
        },
        async waitForCode() {
          const state = new URL(opened[0] ?? "http://127.0.0.1").searchParams.get("state") ?? "";
          return { code: "ms-code", state };
        },
      },
      fetchImpl: async (input) => {
        const url = String(input);
        if (url.includes("login.microsoftonline.com") && url.includes("/token")) {
          return jsonResponse({
            access_token: "ms-access",
            refresh_token: "ms-refresh",
            expires_in: 3600,
          });
        }
        if (url.includes("graph.microsoft.com/v1.0/me")) {
          return jsonResponse({ mail: "you@outlook.com" });
        }
        if (url.includes("/messages")) {
          return jsonResponse({ value: [] });
        }
        return jsonResponse({});
      },
    });
    await service.updateSettings({ outlookClientId: "ms-desktop-client" });
    const result = await service.beginProviderConnect("outlook");
    expect(result.status).toBe("connected");
    expect(opened[0]).toContain("login.microsoftonline.com");
    expect(JSON.stringify(result)).not.toContain("ms-access");
    const listed = await service.listIntegrations();
    expect(listed[0]?.emailAddress).toBe("you@outlook.com");
    expect(await store.getTokens(listed[0]!.id)).toMatchObject({ accessToken: "ms-access" });
  });

  it("identifies no-response applications without sending mail", async () => {
    const applications = createMemoryApplicationRepository();
    const created = await applications.create({
      companyName: "QuietCo",
      roleTitle: "Data Engineer",
    });
    await applications.update({
      id: created.application.id,
      source: "email",
      lifecycleStatus: "applied",
      appliedAt: "2026-07-01",
      lastActivityAt: "2026-07-01",
    });
    const { service } = createHarness(applications);
    const dashboard = await service.dashboard();
    expect(dashboard.summary.awaitingResponse).toBeGreaterThanOrEqual(0);
    const listed = await applications.list();
    expect(listed[0]?.notes ?? "").not.toMatch(/sent automatically/i);
  });

  it("does not treat ATS or assessment senders as the employer", async () => {
    const greenhouse = classifyEmailDeterministic({
      subject: "Your application at Acme",
      senderEmail: "noreply@mail.greenhouse.io",
      senderName: "Acme via Greenhouse",
      snippet:
        "Thank you for applying. We have received your application for Senior React Native Engineer at Acme Inc.",
      bodyText:
        "Thank you for applying. We have received your application for Senior React Native Engineer at Acme Inc.",
      direction: "inbound",
    });
    expect(greenhouse.company).toMatch(/acme/i);
    expect(greenhouse.company).not.toMatch(/greenhouse/i);

    const { service, applications } = createHarness();
    const connected = await service.connectSampleMailbox();
    await service.waitForSync(connected.id);
    const listed = await applications.list();
    expect(listed.some((app) => /greenhouse|hackerrank/i.test(app.companyName))).toBe(false);
    expect(listed.some((app) => /hackerrank/i.test(app.companyDomain ?? ""))).toBe(false);
  });

  it("merges applications on request and can keep a duplicate pair separate", async () => {
    const { service, applications } = createHarness();
    const left = await applications.create({
      companyName: "Acme Inc",
      roleTitle: "Senior React Native Engineer",
    });
    const right = await applications.create({
      companyName: "Acme Inc",
      roleTitle: "Senior React Native Developer",
    });
    const merged = await service.mergeApplications(left.application.id, right.application.id);
    expect(merged?.id).toBe(left.application.id);
    const source = await applications.get(right.application.id);
    expect(source?.archived).toBe(true);
    expect(source?.mergedIntoId).toBe(left.application.id);

    const otherLeft = await applications.create({
      companyName: "Globex",
      roleTitle: "Platform Engineer",
    });
    const otherRight = await applications.create({
      companyName: "Globex",
      roleTitle: "Platform Engineer",
    });
    const before = (await service.dashboard()).duplicates.length;
    await service.dismissDuplicatePair(otherLeft.application.id, otherRight.application.id);
    const after = (await service.dashboard()).duplicates.length;
    expect(after).toBeLessThanOrEqual(before);
    expect(
      (await service.dashboard()).duplicates.some(
        (pair) =>
          (pair.leftId === otherLeft.application.id &&
            pair.rightId === otherRight.application.id) ||
          (pair.leftId === otherRight.application.id && pair.rightId === otherLeft.application.id),
      ),
    ).toBe(false);
  });

  it("classifies already-imported mail when a later page fails", async () => {
    const applications = createMemoryApplicationRepository();
    const store = createMailboxStore(createMemoryKvStore());
    const bus = createInMemoryEventBus();
    let attempts = 0;
    const flaky = {
      id: "fake" as const,
      async listPage() {
        attempts += 1;
        if (attempts === 1) {
          return {
            messages: SAMPLE_MAILBOX_MESSAGES.slice(0, 3),
            nextCursor: "page-2",
          };
        }
        throw new Error("Load failed");
      },
    };
    const service = createMailboxService({
      store,
      applications,
      bus,
      providers: { fake: flaky },
    });
    const connected = await service.connectSampleMailbox();
    const failed = await service.waitForSync(connected.id);
    expect(failed.syncStatus).toBe("failed");
    expect(failed.syncError).toMatch(/connection dropped|Try Sync now/i);
    expect(failed.emailsIngested).toBeGreaterThan(0);
    expect(failed.emailsProcessed).toBeGreaterThan(0);
  });

  it("resumes sync after a provider failure and surfaces Gmail rate limits", async () => {
    const applications = createMemoryApplicationRepository();
    const store = createMailboxStore(createMemoryKvStore());
    const bus = createInMemoryEventBus();
    let attempts = 0;
    const flaky = {
      id: "fake" as const,
      async listPage() {
        attempts += 1;
        if (attempts === 1) {
          throw new Error("network paused");
        }
        return {
          messages: SAMPLE_MAILBOX_MESSAGES.slice(0, 2),
          totalEstimate: 2,
        };
      },
    };
    const service = createMailboxService({
      store,
      applications,
      bus,
      providers: { fake: flaky },
    });
    const connected = await service.connectSampleMailbox();
    const failed = await service.waitForSync(connected.id);
    expect(failed.syncStatus).toBe("failed");
    const retried = await service.sync(connected.id);
    const recovered = await service.waitForSync(retried.id);
    expect(recovered.syncStatus).toBe("idle");
    expect(recovered.emailsProcessed).toBeGreaterThan(0);

    const gmail = createGmailMailboxProvider({
      getTokens: async () => ({ accessToken: "secret-token" }),
      fetchImpl: async () => new Response("slow down", { status: 429 }),
    });
    await expect(gmail.listPage({ pageSize: 1 })).rejects.toThrow(/slow down/i);
  });

  it("later syncs only fetch mail newer than the saved cursor", async () => {
    const applications = createMemoryApplicationRepository();
    const kv = createMemoryKvStore();
    const store = createMailboxStore(kv);
    const bus = createInMemoryEventBus();
    const calls: {
      readonly since?: string;
      readonly exclusiveSince?: boolean;
      readonly historyCursor?: string;
      readonly cursor?: string;
    }[] = [];
    const newer: (typeof SAMPLE_MAILBOX_MESSAGES)[number] = {
      ...SAMPLE_MAILBOX_MESSAGES[0]!,
      providerMessageId: "fake-new",
      threadId: "thread-northwind",
      sentAt: "2026-08-12T12:00:00.000Z",
      receivedAt: "2026-08-12T12:00:00.000Z",
      subject: "Application for Staff Engineer",
      snippet: "Please find my application for Staff Engineer at Northwind.",
      bodyText: "Hello Northwind team, I am applying for Staff Engineer.",
    };
    let generation = 0;
    const provider = {
      id: "fake" as const,
      async listPage(input: {
        readonly cursor?: string;
        readonly since?: string;
        readonly historyCursor?: string;
        readonly pageSize?: number;
        readonly exclusiveSince?: boolean;
      }) {
        calls.push({
          since: input.since,
          exclusiveSince: input.exclusiveSince,
          historyCursor: input.historyCursor,
          cursor: input.cursor,
        });
        generation += 1;
        const pool =
          generation === 1
            ? SAMPLE_MAILBOX_MESSAGES.slice(0, 2)
            : [...SAMPLE_MAILBOX_MESSAGES.slice(0, 2), newer];
        return paginateMessages(pool, input);
      },
    };
    const service = createMailboxService({
      store,
      applications,
      bus,
      providers: { fake: provider },
    });
    const connected = await service.connectSampleMailbox();
    const first = await service.waitForSync(connected.id);
    expect(first.syncStatus).toBe("idle");
    const checkpoint = await store.getCheckpoint(connected.id);
    expect(checkpoint?.initialComplete).toBe(true);
    expect(checkpoint?.watermark).toBe("2026-08-03T09:00:00.000Z");
    const appsAfterFirst = (await applications.list()).length;
    const emailsAfterFirst = (await listDocs(store.emails)).length;

    const restarted = createMailboxService({
      store: createMailboxStore(kv),
      applications,
      bus,
      providers: { fake: provider },
    });
    await restarted.sync(connected.id);
    const second = await restarted.waitForSync(connected.id);
    expect(second.syncStatus).toBe("idle");
    expect(calls[1]?.exclusiveSince).toBe(true);
    expect(calls[1]?.since).toBe(checkpoint?.watermark);
    const emails = await listDocs(store.emails);
    expect(emails.length).toBe(emailsAfterFirst + 1);
    expect(emails.some((email) => email.providerMessageId === "fake-new")).toBe(true);
    expect((await applications.list()).length).toBeGreaterThanOrEqual(appsAfterFirst);
  });

  it("resumes pagination from the saved page cursor after a mid-sync failure", async () => {
    const applications = createMemoryApplicationRepository();
    const store = createMailboxStore(createMemoryKvStore());
    const bus = createInMemoryEventBus();
    const seen: string[] = [];
    let failedResume = false;
    const provider = {
      id: "fake" as const,
      async listPage(input: { readonly cursor?: string }) {
        seen.push(input.cursor ?? "start");
        if (!input.cursor) {
          return {
            messages: SAMPLE_MAILBOX_MESSAGES.slice(0, 1),
            nextCursor: "resume-token",
            totalEstimate: 2,
            historyCursor: "h1",
          };
        }
        if (input.cursor === "resume-token" && !failedResume) {
          failedResume = true;
          throw new Error("network paused");
        }
        return {
          messages: SAMPLE_MAILBOX_MESSAGES.slice(1, 2),
          totalEstimate: 2,
          historyCursor: "h2",
        };
      },
    };
    const service = createMailboxService({
      store,
      applications,
      bus,
      providers: { fake: provider },
    });
    const connected = await service.connectSampleMailbox();
    const failed = await service.waitForSync(connected.id);
    expect(failed.syncStatus).toBe("failed");
    expect(await store.getCheckpoint(connected.id)).toMatchObject({
      pageCursor: "resume-token",
      initialComplete: false,
    });
    const retried = await service.sync(connected.id);
    const recovered = await service.waitForSync(retried.id);
    expect(recovered.syncStatus).toBe("idle");
    expect(seen).toEqual(["start", "resume-token", "resume-token"]);
    expect((await store.getCheckpoint(connected.id))?.initialComplete).toBe(true);
  });

  it("falls back to listing when Gmail history has expired", async () => {
    const urls: string[] = [];
    const gmail = createGmailMailboxProvider({
      getTokens: async () => ({ accessToken: "secret-token" }),
      fetchImpl: async (input) => {
        const url = String(input);
        urls.push(url);
        if (url.includes("/history")) {
          return new Response("not found", { status: 404 });
        }
        if (url.includes("/profile")) {
          return jsonResponse({ historyId: "99" });
        }
        if (url.includes("/messages?")) {
          return jsonResponse({ messages: [], resultSizeEstimate: 0 });
        }
        return jsonResponse({});
      },
    });
    await gmail.listPage({
      exclusiveSince: true,
      historyCursor: "1",
      since: "2026-08-03T09:00:00.000Z",
      pageSize: 1,
    });
    expect(urls.some((url) => url.includes("/history"))).toBe(true);
    expect(urls.some((url) => url.includes("/messages?"))).toBe(true);
    expect(urls.some((url) => /after%3A|after:/.test(url))).toBe(true);
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function createHarness(applications = createMemoryApplicationRepository()) {
  const store = createMailboxStore(createMemoryKvStore());
  const bus = createInMemoryEventBus();
  const service = createMailboxService({ store, applications, bus });
  return { service, applications, store, bus };
}

function application(
  input: Partial<Application> & Pick<Application, "companyName" | "roleTitle">,
): Application {
  return {
    id: "app_test",
    stage: "send",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...input,
  };
}
