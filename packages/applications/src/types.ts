import type { ApplicationId, PipelineStage, RoleId } from "@jobjitsu/shared";
import type { ApplicationLifecycleStatus, ApplicationSource } from "./lifecycle.js";

/**
 * Tracking status labels mapped from prep `PipelineStage` (DATA_MODELS).
 * Drafts start at Discovered (`discover`).
 */
export const APPLICATION_TRACKING_BY_STAGE = {
  discover: "Discovered",
  curate: "Discovered",
  tailor: "ResumePrepared",
  queue: "ReadyForReview",
  approve: "Approved",
  send: "Submitted",
  follow_up: "FollowUpSent",
} as const satisfies Record<PipelineStage, string>;

export type ApplicationTrackingStatus =
  (typeof APPLICATION_TRACKING_BY_STAGE)[keyof typeof APPLICATION_TRACKING_BY_STAGE];

/**
 * On-device application draft — DATA_MODELS Application.
 * Role may be fixture/manual; Job Provider not required.
 */
export type Application = {
  readonly id: ApplicationId;
  /** Prep / egress stage — maps to tracking status for UI. */
  readonly stage: PipelineStage;
  readonly companyName: string;
  readonly roleTitle: string;
  readonly sourceUrl?: string;
  readonly requisitionId?: string;
  readonly roleId?: RoleId;
  readonly resumeVersionId?: string;
  readonly notes?: string;
  /** Editable tailored résumé draft text — user remains author (PE03-S04). */
  readonly resumeDraftText?: string;
  /** Editable cover letter draft text — user remains author (PE08-S02). */
  readonly coverLetterDraftText?: string;
  /** ISO date (YYYY-MM-DD) when a follow-up is due — local reminder only. */
  readonly followUpAt?: string;
  /** Draft follow-up note — never sent automatically. */
  readonly followUpDraftText?: string;
  /** Stable local id for FollowUp.* events when scheduled. */
  readonly followUpId?: string;
  /** How this draft entered the local store. */
  readonly source?: ApplicationSource;
  /** Post-send lifecycle from email evidence — not a prep pipeline stage. */
  readonly lifecycleStatus?: ApplicationLifecycleStatus;
  readonly companyDomain?: string;
  readonly appliedAt?: string;
  readonly lastActivityAt?: string;
  readonly nextAction?: string;
  readonly nextActionDueAt?: string;
  readonly recruiterName?: string;
  readonly recruiterEmail?: string;
  /** 0–1 match/classification confidence for email-sourced rows. */
  readonly confidence?: number;
  readonly archived?: boolean;
  /**
   * User corrections — later sync must not overwrite these keys.
   * Resolved values prefer overrides over AI/extracted fields.
   */
  readonly userOverrides?: ApplicationUserOverrides;
  readonly linkedEmailIds?: readonly string[];
  readonly linkedThreadIds?: readonly string[];
  /** When this row was merged into another application. */
  readonly mergedIntoId?: ApplicationId;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ApplicationUserOverrides = {
  readonly companyName?: string;
  readonly roleTitle?: string;
  readonly lifecycleStatus?: ApplicationLifecycleStatus;
  readonly appliedAt?: string;
  readonly recruiterName?: string;
  readonly recruiterEmail?: string;
  readonly companyDomain?: string;
};

export type ApplicationDraftInput = {
  readonly companyName: string;
  readonly roleTitle: string;
  readonly sourceUrl?: string;
  readonly requisitionId?: string;
  /** Optional fixture/manual role id — discovery not required. */
  readonly roleId?: RoleId;
  readonly resumeVersionId?: string;
  readonly notes?: string;
  readonly resumeDraftText?: string;
  readonly coverLetterDraftText?: string;
  /**
   * When true, create even if a soft-duplicate exists.
   * Default false still creates, but callers surface `duplicateWarning`.
   */
  readonly acknowledgeDuplicate?: boolean;
};

export type ApplicationDraftPatch = {
  readonly id: ApplicationId;
  readonly companyName?: string;
  readonly roleTitle?: string;
  readonly sourceUrl?: string | null;
  readonly requisitionId?: string | null;
  readonly roleId?: RoleId | null;
  readonly resumeVersionId?: string | null;
  readonly notes?: string | null;
  readonly resumeDraftText?: string | null;
  readonly coverLetterDraftText?: string | null;
  readonly followUpAt?: string | null;
  readonly followUpDraftText?: string | null;
  readonly followUpId?: string | null;
  readonly stage?: PipelineStage;
  readonly source?: ApplicationSource | null;
  readonly lifecycleStatus?: ApplicationLifecycleStatus | null;
  readonly companyDomain?: string | null;
  readonly appliedAt?: string | null;
  readonly lastActivityAt?: string | null;
  readonly nextAction?: string | null;
  readonly nextActionDueAt?: string | null;
  readonly recruiterName?: string | null;
  readonly recruiterEmail?: string | null;
  readonly confidence?: number | null;
  readonly archived?: boolean;
  readonly userOverrides?: ApplicationUserOverrides | null;
  readonly linkedEmailIds?: readonly string[] | null;
  readonly linkedThreadIds?: readonly string[] | null;
  readonly mergedIntoId?: ApplicationId | null;
};

export type DuplicateWarning = {
  readonly matchedApplicationId: ApplicationId;
  readonly message: string;
};

export type CreateDraftResult = {
  readonly application: Application;
  readonly duplicateWarning?: DuplicateWarning;
};

export type UpdateDraftResult = {
  readonly application: Application;
  readonly duplicateWarning?: DuplicateWarning;
};

export type ApplicationRepository = {
  list(): Promise<readonly Application[]>;
  get(id: ApplicationId): Promise<Application | undefined>;
  create(input: ApplicationDraftInput): Promise<CreateDraftResult>;
  update(patch: ApplicationDraftPatch): Promise<UpdateDraftResult>;
  /** Remove a local draft. Returns false if it was already gone. */
  delete(id: ApplicationId): Promise<boolean>;
};

export function trackingStatusForStage(stage: PipelineStage): ApplicationTrackingStatus {
  return APPLICATION_TRACKING_BY_STAGE[stage];
}
