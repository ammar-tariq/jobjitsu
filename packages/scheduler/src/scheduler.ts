import type { JobId, Result } from "@jobjitsu/core";

/**
 * Local scheduler contracts — quiet jobs, no cloud orchestra, no guilt nags.
 * @see docs/architecture/SCHEDULER.md
 */

export const CORE_JOB_TYPES = [
  "followup.due",
  "agent.prepWindow",
  "ai.healthCheck",
  "timeline.compact",
] as const;

export type CoreJobType = (typeof CORE_JOB_TYPES)[number];

/** Extension jobs use `extension.<id>` — still capability-gated by host. */
export type JobType = CoreJobType | `extension.${string}` | (string & {});

export type JobStatus = "scheduled" | "running" | "succeeded" | "failed" | "cancelled" | "deferred";

export interface ScheduledJob {
  readonly id: JobId;
  readonly type: JobType;
  /** ISO-8601 — earliest run instant. */
  readonly notBefore: string;
  /** Opaque payload refs (IDs), not résumé bodies. */
  readonly payloadRef?: Record<string, string>;
  readonly status: JobStatus;
  readonly attempt?: number;
  readonly lastError?: string;
}

export interface ArmJobInput {
  readonly type: JobType;
  readonly notBefore: string;
  readonly payloadRef?: Record<string, string>;
  readonly id?: JobId;
}

export interface JobStore {
  get(id: JobId): Promise<Result<ScheduledJob | undefined>>;
  put(job: ScheduledJob): Promise<Result<void>>;
  delete(id: JobId): Promise<Result<void>>;
  listDue(at: string): Promise<Result<readonly ScheduledJob[]>>;
  listByType(type: JobType): Promise<Result<readonly ScheduledJob[]>>;
}

export type JobHandlerResult =
  | { readonly status: "succeeded" }
  | { readonly status: "failed"; readonly error?: string }
  | { readonly status: "deferred"; readonly notBefore: string };

export type JobHandler = (job: ScheduledJob) => Promise<JobHandlerResult>;

/**
 * Arms, wakes, and dispatches local jobs.
 * Must never auto-send applications — at most mark due / enqueue review.
 */
export interface Scheduler {
  arm(input: ArmJobInput): Promise<Result<ScheduledJob>>;
  cancel(id: JobId): Promise<Result<void>>;
  registerHandler(type: JobType, handler: JobHandler): void;
  /** Process due jobs once (host timer / tick). */
  tick(now?: Date): Promise<Result<{ readonly ran: number }>>;
}
