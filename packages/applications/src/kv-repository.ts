import { createEntityId, type ApplicationId, type PipelineStage } from "@jobjitsu/shared";
import type { KvStore } from "@jobjitsu/storage";
import { findDuplicateWarning } from "./duplicate.js";
import type {
  Application,
  ApplicationDraftInput,
  ApplicationDraftPatch,
  ApplicationRepository,
  CreateDraftResult,
  UpdateDraftResult,
} from "./types.js";

export const APPLICATIONS_STORAGE_KEY = {
  namespace: "applications",
  id: "drafts",
} as const;

type ApplicationsDocument = {
  readonly applications: readonly Application[];
};

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

function sortByUpdated(apps: readonly Application[]): Application[] {
  return [...apps].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/**
 * Application drafts on local KV — survives restart under the data folder.
 * On-device only; no network.
 */
export function createKvApplicationRepository(kv: KvStore): ApplicationRepository {
  async function readDoc(): Promise<ApplicationsDocument> {
    const row = await kv.get<ApplicationsDocument>(APPLICATIONS_STORAGE_KEY);
    if (!row.ok) {
      throw new Error(row.error.message ?? row.error.title);
    }
    return { applications: row.value?.applications ?? [] };
  }

  async function writeDoc(doc: ApplicationsDocument): Promise<void> {
    const written = await kv.set(APPLICATIONS_STORAGE_KEY, {
      applications: doc.applications,
    });
    if (!written.ok) {
      throw new Error(written.error.message ?? written.error.title);
    }
  }

  return {
    async list() {
      const doc = await readDoc();
      return sortByUpdated(doc.applications);
    },

    async get(id) {
      const doc = await readDoc();
      return doc.applications.find((application) => application.id === id);
    },

    async create(input: ApplicationDraftInput): Promise<CreateDraftResult> {
      const companyName = requireText(input.companyName, "company name");
      const roleTitle = requireText(input.roleTitle, "role title");
      const now = new Date().toISOString();
      const doc = await readDoc();
      const duplicateWarning = findDuplicateWarning(doc.applications, {
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
      await writeDoc({ applications: [...doc.applications, application] });
      return { application, duplicateWarning };
    },

    async update(patch: ApplicationDraftPatch): Promise<UpdateDraftResult> {
      const doc = await readDoc();
      const existing = doc.applications.find((application) => application.id === patch.id);
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

      const duplicateWarning = findDuplicateWarning(
        doc.applications,
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
        stage,
        updatedAt: new Date().toISOString(),
      };
      await writeDoc({
        applications: doc.applications.map((application) =>
          application.id === next.id ? next : application,
        ),
      });
      return { application: next, duplicateWarning };
    },

    async delete(id) {
      const doc = await readDoc();
      if (!doc.applications.some((application) => application.id === id)) {
        return false;
      }
      await writeDoc({
        applications: doc.applications.filter((application) => application.id !== id),
      });
      return true;
    },
  };
}
