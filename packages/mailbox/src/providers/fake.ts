import { SAMPLE_MAILBOX_MESSAGES } from "../fingerprint.js";
import type { MailboxListPage } from "../types.js";
import { paginateMessages, type MailboxProvider } from "./types.js";

export function createFakeMailboxProvider(messages = SAMPLE_MAILBOX_MESSAGES): MailboxProvider {
  return {
    id: "fake",
    async listPage(input): Promise<MailboxListPage> {
      return paginateMessages(messages, {
        cursor: input.cursor,
        since: input.since,
        pageSize: input.pageSize,
        exclusiveSince: input.exclusiveSince,
      });
    },
  };
}
