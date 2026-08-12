import type { MailboxProviderMessage } from "./types.js";

export { SAMPLE_MAILBOX_MESSAGES } from "./fingerprint.js";

export function lookbackCutoff(lookbackDays: number, now = new Date()): string {
  const ms = lookbackDays * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - ms).toISOString();
}

export function messageTimestamp(message: MailboxProviderMessage): string | undefined {
  return message.receivedAt ?? message.sentAt;
}
