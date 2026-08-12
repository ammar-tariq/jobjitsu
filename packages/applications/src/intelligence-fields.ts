import type { Application, ApplicationDraftPatch } from "./types.js";
import { overlayOptional } from "./overlay.js";

/**
 * Apply email-intelligence / lifecycle fields from a draft patch.
 * User overrides are stored as given; callers must not let sync wipe them.
 */
export function applyIntelligencePatch(
  existing: Application,
  patch: ApplicationDraftPatch,
): Pick<
  Application,
  | "source"
  | "lifecycleStatus"
  | "companyDomain"
  | "appliedAt"
  | "lastActivityAt"
  | "nextAction"
  | "nextActionDueAt"
  | "recruiterName"
  | "recruiterEmail"
  | "confidence"
  | "archived"
  | "userOverrides"
  | "linkedEmailIds"
  | "linkedThreadIds"
  | "mergedIntoId"
> {
  return {
    source: overlayOptional(existing.source, patch.source),
    lifecycleStatus: overlayOptional(existing.lifecycleStatus, patch.lifecycleStatus),
    companyDomain: overlayOptional(existing.companyDomain, patch.companyDomain),
    appliedAt: overlayOptional(existing.appliedAt, patch.appliedAt),
    lastActivityAt: overlayOptional(existing.lastActivityAt, patch.lastActivityAt),
    nextAction: overlayOptional(existing.nextAction, patch.nextAction),
    nextActionDueAt: overlayOptional(existing.nextActionDueAt, patch.nextActionDueAt),
    recruiterName: overlayOptional(existing.recruiterName, patch.recruiterName),
    recruiterEmail: overlayOptional(existing.recruiterEmail, patch.recruiterEmail),
    confidence: overlayOptional(existing.confidence, patch.confidence),
    archived: patch.archived ?? existing.archived,
    userOverrides: overlayOptional(existing.userOverrides, patch.userOverrides),
    linkedEmailIds: overlayOptional(existing.linkedEmailIds, patch.linkedEmailIds),
    linkedThreadIds: overlayOptional(existing.linkedThreadIds, patch.linkedThreadIds),
    mergedIntoId: overlayOptional(existing.mergedIntoId, patch.mergedIntoId),
  };
}

/** Final display values — user corrections win over extracted/AI values. */
export function resolveApplicationView(application: Application): {
  readonly companyName: string;
  readonly roleTitle: string;
  readonly lifecycleStatus: Application["lifecycleStatus"];
  readonly appliedAt: string | undefined;
  readonly recruiterName: string | undefined;
  readonly recruiterEmail: string | undefined;
  readonly companyDomain: string | undefined;
} {
  const overrides = application.userOverrides;
  return {
    companyName: overrides?.companyName ?? application.companyName,
    roleTitle: overrides?.roleTitle ?? application.roleTitle,
    lifecycleStatus: overrides?.lifecycleStatus ?? application.lifecycleStatus,
    appliedAt: overrides?.appliedAt ?? application.appliedAt,
    recruiterName: overrides?.recruiterName ?? application.recruiterName,
    recruiterEmail: overrides?.recruiterEmail ?? application.recruiterEmail,
    companyDomain: overrides?.companyDomain ?? application.companyDomain,
  };
}
