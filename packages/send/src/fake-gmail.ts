import {
  createAppError,
  createEntityId,
  err,
  ok,
  type ApplicationId,
  type Result,
} from "@jobjitsu/shared";
import type { SendChannel, SendRequest, SendResult } from "./channel.js";

export interface FakeGmailMessage {
  readonly id: string;
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly applicationId: ApplicationId;
  readonly sentAt: string;
}

export interface FakeGmailChannel extends SendChannel {
  /** In-memory outbox — never hits the network. */
  readonly outbox: readonly FakeGmailMessage[];
  clearOutbox(): void;
}

export type FakeGmailChannelOptions = {
  readonly id?: string;
  /** Force a failed Result for negative tests. */
  readonly fail?: boolean;
};

/**
 * Fake Gmail channel — records mail locally.
 * Does **not** connect to Google / SMTP / IMAP.
 */
export function createFakeGmailChannel(options: FakeGmailChannelOptions = {}): FakeGmailChannel {
  const id = options.id ?? "fake-gmail";
  const messages: FakeGmailMessage[] = [];

  const channel: FakeGmailChannel = {
    id,
    destinationClass: "mail",
    get outbox() {
      return messages;
    },
    clearOutbox() {
      messages.length = 0;
    },
    async send(request: SendRequest): Promise<Result<SendResult>> {
      if (request.destinationClass !== "mail") {
        return err(
          createAppError("validation", "Wrong destination", {
            message: "Fake Gmail only accepts mail destinationClass",
          }),
        );
      }
      if (!request.to.includes("@")) {
        return err(
          createAppError("validation", "Invalid recipient", {
            message: "Provide an email-shaped address for the fake outbox",
          }),
        );
      }
      if (options.fail) {
        return err(
          createAppError("egress_failed", "Fake Gmail refused send", {
            detail: "fail flag set for tests",
          }),
        );
      }

      const messageId = createEntityId("mail");
      messages.push({
        id: messageId,
        to: request.to,
        subject: request.subject,
        body: request.body,
        applicationId: request.applicationId,
        sentAt: new Date().toISOString(),
      });

      return ok({
        outcome: "succeeded",
        messageId,
        detail: "Recorded in fake Gmail outbox (not delivered)",
      });
    },
  };

  return channel;
}
