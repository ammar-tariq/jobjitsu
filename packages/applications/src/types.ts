import type { ApplicationId, PipelineStage, RoleId } from "@jobjitsu/shared";

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
  readonly createdAt: string;
  readonly updatedAt: string;
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
  readonly stage?: PipelineStage;
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
};

export function trackingStatusForStage(stage: PipelineStage): ApplicationTrackingStatus {
  return APPLICATION_TRACKING_BY_STAGE[stage];
}
