/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/applications" as const;

export {
  APPLICATION_TRACKING_BY_STAGE,
  trackingStatusForStage,
  type Application,
  type ApplicationDraftInput,
  type ApplicationDraftPatch,
  type ApplicationRepository,
  type ApplicationTrackingStatus,
  type CreateDraftResult,
  type DuplicateWarning,
  type UpdateDraftResult,
} from "./types.js";

export { applicationDuplicateKey, findDuplicateWarning } from "./duplicate.js";
export { createMemoryApplicationRepository } from "./memory-repository.js";
export {
  createApplicationDraft,
  deleteApplicationDraft,
  updateApplicationDraft,
} from "./drafts.js";
export { createKvApplicationRepository, APPLICATIONS_STORAGE_KEY } from "./kv-repository.js";
