import { createEntityId } from "@jobjitsu/shared";
import { createDocumentStore, type DocumentStore, type KvStore } from "@jobjitsu/storage";
import {
  DEFAULT_MAILBOX_SETTINGS,
  type MailboxAction,
  type MailboxEmail,
  type MailboxIntegration,
  type MailboxOAuthTokens,
  type MailboxSettings,
  type MailboxSyncCheckpoint,
  type MailboxTimelineEvent,
} from "./types.js";

const SETTINGS_KEY = { namespace: "mailbox.settings", id: "current" } as const;
const INDEX_KEY = { namespace: "mailbox.index", id: "provider-messages" } as const;
const SECRETS_NS = "mailbox.secrets";
const CURSOR_NS = "mailbox.cursors";

type ProviderMessageIndex = {
  readonly id: string;
  readonly byProviderMessage: Record<string, string>;
};

export type MailboxStore = {
  readonly integrations: DocumentStore<MailboxIntegration>;
  readonly emails: DocumentStore<MailboxEmail>;
  readonly actions: DocumentStore<MailboxAction>;
  readonly timeline: DocumentStore<MailboxTimelineEvent>;
  getSettings(): Promise<MailboxSettings>;
  putSettings(settings: MailboxSettings): Promise<void>;
  getTokens(integrationId: string): Promise<MailboxOAuthTokens | undefined>;
  putTokens(integrationId: string, tokens: MailboxOAuthTokens): Promise<void>;
  deleteTokens(integrationId: string): Promise<void>;
  findEmailId(provider: string, providerMessageId: string): Promise<string | undefined>;
  rememberEmailId(provider: string, providerMessageId: string, emailId: string): Promise<void>;
  getCheckpoint(integrationId: string): Promise<MailboxSyncCheckpoint | undefined>;
  putCheckpoint(checkpoint: MailboxSyncCheckpoint): Promise<void>;
  deleteCheckpoint(integrationId: string): Promise<void>;
  unprocessedEmails(): Promise<readonly MailboxEmail[]>;
};

function requireOk<T>(
  result: { ok: true; value: T } | { ok: false; error: { message?: string; title: string } },
): T {
  if (!result.ok) {
    throw new Error(result.error.message ?? result.error.title);
  }
  return result.value;
}

export function createMailboxStore(kv: KvStore): MailboxStore {
  const integrations = createDocumentStore<MailboxIntegration>(kv, "mailbox.integrations");
  const emails = createDocumentStore<MailboxEmail>(kv, "mailbox.emails");
  const actions = createDocumentStore<MailboxAction>(kv, "mailbox.actions");
  const timeline = createDocumentStore<MailboxTimelineEvent>(kv, "mailbox.timeline");

  async function readIndex(): Promise<ProviderMessageIndex> {
    const row = await kv.get<ProviderMessageIndex>(INDEX_KEY);
    return requireOk(row) ?? { id: "provider-messages", byProviderMessage: {} };
  }

  return {
    integrations,
    emails,
    actions,
    timeline,
    async getSettings() {
      const row = await kv.get<MailboxSettings>(SETTINGS_KEY);
      return { ...DEFAULT_MAILBOX_SETTINGS, ...(requireOk(row) ?? {}) };
    },
    async putSettings(settings) {
      requireOk(await kv.set(SETTINGS_KEY, settings));
    },
    async getTokens(integrationId) {
      const row = await kv.get<MailboxOAuthTokens>({ namespace: SECRETS_NS, id: integrationId });
      return requireOk(row);
    },
    async putTokens(integrationId, tokens) {
      requireOk(await kv.set({ namespace: SECRETS_NS, id: integrationId }, tokens));
    },
    async deleteTokens(integrationId) {
      requireOk(await kv.delete({ namespace: SECRETS_NS, id: integrationId }));
    },
    async findEmailId(provider, providerMessageId) {
      const index = await readIndex();
      return index.byProviderMessage[`${provider}:${providerMessageId}`];
    },
    async rememberEmailId(provider, providerMessageId, emailId) {
      const index = await readIndex();
      requireOk(
        await kv.set(INDEX_KEY, {
          id: "provider-messages",
          byProviderMessage: {
            ...index.byProviderMessage,
            [`${provider}:${providerMessageId}`]: emailId,
          },
        }),
      );
    },
    async getCheckpoint(integrationId) {
      const row = await kv.get<MailboxSyncCheckpoint>({ namespace: CURSOR_NS, id: integrationId });
      return requireOk(row);
    },
    async putCheckpoint(checkpoint) {
      requireOk(await kv.set({ namespace: CURSOR_NS, id: checkpoint.id }, checkpoint));
    },
    async deleteCheckpoint(integrationId) {
      requireOk(await kv.delete({ namespace: CURSOR_NS, id: integrationId }));
    },
    async unprocessedEmails() {
      const listed = requireOk(await emails.list());
      return listed
        .filter((email) => !email.processed)
        .sort((a, b) => {
          const left = a.sentAt ?? a.receivedAt ?? a.createdAt;
          const right = b.sentAt ?? b.receivedAt ?? b.createdAt;
          return left.localeCompare(right);
        });
    },
  };
}

export async function readDoc<T extends { readonly id: string }>(
  store: DocumentStore<T>,
  id: string,
): Promise<T | undefined> {
  const row = await store.get(id);
  return requireOk(row);
}

export async function listDocs<T extends { readonly id: string }>(
  store: DocumentStore<T>,
): Promise<readonly T[]> {
  return requireOk(await store.list());
}

export function newLocalId(prefix: string): string {
  return createEntityId(prefix);
}
