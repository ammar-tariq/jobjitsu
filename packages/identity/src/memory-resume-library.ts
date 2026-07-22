import { createEntityId } from "@jobjitsu/shared";
import type { ResumeImportInput, ResumeLibrary, ResumeVersion } from "./types.js";

const DEFAULT_PROFILE_ID = "profile_local";

export type NormalizedResumeImport = {
  readonly label: string;
  readonly fileName: string;
  readonly bytes: Uint8Array;
  readonly contentType?: string;
  readonly profileId: string;
  readonly parentVersionId?: string;
};

/** Validate import fields — calm, recoverable messages for the UI. */
export function normalizeResumeImport(input: ResumeImportInput): NormalizedResumeImport {
  const label = input.label.trim();
  if (!label) {
    throw new Error("Add a short label for this resume version.");
  }
  const fileName = input.fileName.trim();
  if (!fileName) {
    throw new Error("Choose a resume file to import.");
  }
  if (input.bytes.byteLength === 0) {
    throw new Error("That file looks empty. Pick another resume and try again.");
  }
  const parentVersionId = input.parentVersionId?.trim() || undefined;
  return {
    label,
    fileName,
    bytes: input.bytes,
    contentType: input.contentType?.trim() || undefined,
    profileId: (input.profileId ?? DEFAULT_PROFILE_ID).trim() || DEFAULT_PROFILE_ID,
    parentVersionId,
  };
}

/**
 * Process-local Resume Library for host / UI tests.
 * On-device only — no network and no `@jobjitsu/storage` FS imports (browser-safe).
 */
export function createMemoryResumeLibrary(): ResumeLibrary {
  const versions = new Map<string, ResumeVersion>();
  const blobs = new Map<string, Uint8Array>();
  let selectedId: string | undefined;

  return {
    async import(input: ResumeImportInput) {
      const normalized = normalizeResumeImport(input);
      if (normalized.parentVersionId && !versions.has(normalized.parentVersionId)) {
        throw new Error("That parent version is not in your library. Pick another and try again.");
      }
      const blobId = createEntityId("blob");
      blobs.set(blobId, normalized.bytes);
      const version: ResumeVersion = {
        id: createEntityId("resume"),
        profileId: normalized.profileId,
        label: normalized.label,
        createdAt: new Date().toISOString(),
        format: "document",
        blobId,
        fileName: normalized.fileName,
        contentType: normalized.contentType,
        byteLength: normalized.bytes.byteLength,
        parentVersionId: normalized.parentVersionId,
      };
      versions.set(version.id, version);
      if (!selectedId) {
        selectedId = version.id;
      }
      return version;
    },

    async list() {
      return [...versions.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async get(id: string) {
      return versions.get(id);
    },

    async getSelected() {
      return selectedId ? versions.get(selectedId) : undefined;
    },

    async select(resumeId: string) {
      const version = versions.get(resumeId);
      if (!version) {
        throw new Error("That resume version is not in your library. Pick another and try again.");
      }
      selectedId = version.id;
      return version;
    },
  };
}
