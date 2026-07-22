import type { ApplicationId } from "@jobjitsu/shared";
import type { EgressDestinationClass, SendOutcome } from "@jobjitsu/events";
import type { AppError, Result } from "@jobjitsu/shared";

/**
 * Outbound channel contract — only `@jobjitsu/send` orchestrates these.
 * Channels must not skip approval policy; the host enforces that.
 */

export interface SendRequest {
  readonly applicationId: ApplicationId;
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly destinationClass: EgressDestinationClass;
}

export interface SendResult {
  readonly outcome: SendOutcome;
  /** Safe machine detail — never claim real Gmail delivery for fakes. */
  readonly detail?: string;
  readonly messageId?: string;
}

export interface SendChannel {
  readonly id: string;
  readonly destinationClass: EgressDestinationClass;
  send(request: SendRequest): Promise<Result<SendResult, AppError>>;
}
