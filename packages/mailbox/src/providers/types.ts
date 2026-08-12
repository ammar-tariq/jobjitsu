import type { MailboxListPage, MailboxProviderId, MailboxProviderMessage } from "../types.js";

export type MailboxProvider = {
  readonly id: MailboxProviderId;
  listPage(input: {
    readonly cursor?: string;
    readonly since?: string;
    readonly historyCursor?: string;
    readonly pageSize?: number;
    readonly exclusiveSince?: boolean;
  }): Promise<MailboxListPage>;
};

export function paginateMessages(
  messages: readonly MailboxProviderMessage[],
  input: {
    readonly cursor?: string;
    readonly since?: string;
    readonly pageSize?: number;
    readonly exclusiveSince?: boolean;
  },
): MailboxListPage {
  const pageSize = input.pageSize ?? 25;
  const sinceMs = input.since ? Date.parse(input.since) : Number.NaN;
  const filtered = messages.filter((message) => {
    if (!Number.isFinite(sinceMs)) {
      return true;
    }
    const stamp = Date.parse(message.receivedAt ?? message.sentAt ?? "");
    if (!Number.isFinite(stamp)) {
      return !input.exclusiveSince;
    }
    return input.exclusiveSince ? stamp > sinceMs : stamp >= sinceMs;
  });
  const start = input.cursor ? Number.parseInt(input.cursor, 10) || 0 : 0;
  const slice = filtered.slice(start, start + pageSize);
  const next = start + pageSize;
  const newest = filtered.reduce<string | undefined>((current, message) => {
    const stamp = message.receivedAt ?? message.sentAt;
    if (!stamp) {
      return current;
    }
    return !current || stamp > current ? stamp : current;
  }, undefined);
  return {
    messages: slice,
    nextCursor: next < filtered.length ? String(next) : undefined,
    totalEstimate: filtered.length,
    historyCursor: newest,
  };
}
