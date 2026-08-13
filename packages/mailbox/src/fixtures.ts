import type { MailboxProviderMessage } from "./types.js";

export { SAMPLE_MAILBOX_MESSAGES } from "./fingerprint.js";

/**
 * ISO cutoff for first sync. `lookbackDays <= 0` means no date filter (entire mailbox).
 */
export function lookbackCutoff(lookbackDays: number, now = new Date()): string | undefined {
  if (lookbackDays <= 0) {
    return undefined;
  }
  const ms = lookbackDays * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - ms).toISOString();
}

export function messageTimestamp(message: MailboxProviderMessage): string | undefined {
  return message.receivedAt ?? message.sentAt;
}
