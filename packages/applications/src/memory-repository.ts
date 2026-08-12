import { createEntityId, type ApplicationId, type PipelineStage } from "@jobjitsu/shared";
import { findDuplicateWarning } from "./duplicate.js";
import { applyIntelligencePatch } from "./intelligence-fields.js";
import type {
  Application,
  ApplicationDraftInput,
  ApplicationDraftPatch,
  ApplicationRepository,
  CreateDraftResult,
  UpdateDraftResult,
} from "./types.js";

function requireText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Add a ${label} for this application.`);
  }
  return trimmed;
}

function optionalText(value: string | undefined | null): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Process-local application repository for host / UI tests.
 * On-device only — no network (browser-safe).
 */
export function createMemoryApplicationRepository(): ApplicationRepository {
  const apps = new Map<string, Application>();

  return {
    async list() {
      return [...apps.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async get(id) {
      return apps.get(id);
    },

    async create(input: ApplicationDraftInput): Promise<CreateDraftResult> {
      const companyName = requireText(input.companyName, "company name");
      const roleTitle = requireText(input.roleTitle, "role title");
      const now = new Date().toISOString();
      const listed = [...apps.values()];
      const duplicateWarning = findDuplicateWarning(listed, {
        companyName,
        roleTitle,
        sourceUrl: optionalText(input.sourceUrl),
        requisitionId: optionalText(input.requisitionId),
      });

      const application: Application = {
        id: createEntityId("app") as ApplicationId,
        stage: "discover",
        companyName,
        roleTitle,
        sourceUrl: optionalText(input.sourceUrl),
        requisitionId: optionalText(input.requisitionId),
        roleId: input.roleId,
        resumeVersionId: optionalText(input.resumeVersionId),
        notes: optionalText(input.notes),
        resumeDraftText: optionalText(input.resumeDraftText),
        coverLetterDraftText: optionalText(input.coverLetterDraftText),
        createdAt: now,
        updatedAt: now,
      };
      apps.set(application.id, application);
      return { application, duplicateWarning };
    },

    async update(patch: ApplicationDraftPatch): Promise<UpdateDraftResult> {
      const existing = apps.get(patch.id);
      if (!existing) {
        throw new Error(
          "That application draft is not on this device. Pick another and try again.",
        );
      }

      const companyName =
        patch.companyName !== undefined
          ? requireText(patch.companyName, "company name")
          : existing.companyName;
      const roleTitle =
        patch.roleTitle !== undefined
          ? requireText(patch.roleTitle, "role title")
          : existing.roleTitle;
      const sourceUrl =
        patch.sourceUrl === null
          ? undefined
          : patch.sourceUrl !== undefined
            ? optionalText(patch.sourceUrl)
            : existing.sourceUrl;
      const requisitionId =
        patch.requisitionId === null
          ? undefined
          : patch.requisitionId !== undefined
            ? optionalText(patch.requisitionId)
            : existing.requisitionId;

      const listed = [...apps.values()];
      const duplicateWarning = findDuplicateWarning(
        listed,
        { companyName, roleTitle, sourceUrl, requisitionId },
        { excludeId: existing.id },
      );

      const stage: PipelineStage = patch.stage ?? existing.stage;
      const next: Application = {
        ...existing,
        companyName,
        roleTitle,
        sourceUrl,
        requisitionId,
        roleId:
          patch.roleId === null
            ? undefined
            : patch.roleId !== undefined
              ? patch.roleId
              : existing.roleId,
        resumeVersionId:
          patch.resumeVersionId === null
            ? undefined
            : patch.resumeVersionId !== undefined
              ? optionalText(patch.resumeVersionId)
              : existing.resumeVersionId,
        notes:
          patch.notes === null
            ? undefined
            : patch.notes !== undefined
              ? optionalText(patch.notes)
              : existing.notes,
        resumeDraftText:
          patch.resumeDraftText === null
            ? undefined
            : patch.resumeDraftText !== undefined
              ? optionalText(patch.resumeDraftText)
              : existing.resumeDraftText,
        coverLetterDraftText:
          patch.coverLetterDraftText === null
            ? undefined
            : patch.coverLetterDraftText !== undefined
              ? optionalText(patch.coverLetterDraftText)
              : existing.coverLetterDraftText,
        followUpAt:
          patch.followUpAt === null
            ? undefined
            : patch.followUpAt !== undefined
              ? optionalText(patch.followUpAt)
              : existing.followUpAt,
        followUpDraftText:
          patch.followUpDraftText === null
            ? undefined
            : patch.followUpDraftText !== undefined
              ? optionalText(patch.followUpDraftText)
              : existing.followUpDraftText,
        followUpId:
          patch.followUpId === null
            ? undefined
            : patch.followUpId !== undefined
              ? optionalText(patch.followUpId)
              : existing.followUpId,
        ...applyIntelligencePatch(existing, patch),
        stage,
        updatedAt: new Date().toISOString(),
      };
      apps.set(next.id, next);
      return { application: next, duplicateWarning };
    },

    async delete(id) {
      return apps.delete(id);
    },
  };
}
