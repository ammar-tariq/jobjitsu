import { createEntityId } from "@jobjitsu/shared";
import { createDocumentStore, type BlobStore, type KvStore } from "@jobjitsu/storage";
import { normalizeResumeImport } from "./memory-resume-library.js";
import type { ResumeImportInput, ResumeLibrary, ResumeVersion } from "./types.js";

const RESUME_VERSION_NAMESPACE = "identity.resume";
const SELECTED_KEY = { namespace: "identity", id: "resume_selected" } as const;

/**
 * Resume Library on local KV + blob store — originals stay on-device.
 * Select updates local selection only — never Send.
 */
export function createStorageResumeLibrary(kv: KvStore, blobs: BlobStore): ResumeLibrary {
  const docs = createDocumentStore<ResumeVersion>(kv, RESUME_VERSION_NAMESPACE);

  return {
    async import(input: ResumeImportInput) {
      const normalized = normalizeResumeImport(input);
      if (normalized.parentVersionId) {
        const parent = await docs.get(normalized.parentVersionId);
        if (!parent.ok) {
          throw new Error(parent.error.message ?? parent.error.title);
        }
        if (!parent.value) {
          throw new Error(
            "That parent version is not in your library. Pick another and try again.",
          );
        }
      }

      const put = await blobs.put(normalized.bytes, {
        fileName: normalized.fileName,
        contentType: normalized.contentType,
      });
      if (!put.ok) {
        throw new Error(put.error.message ?? put.error.title);
      }

      const stored: ResumeVersion = {
        id: createEntityId("resume"),
        profileId: normalized.profileId,
        label: normalized.label,
        createdAt: new Date().toISOString(),
        format: "document",
        blobId: put.value.id,
        fileName: put.value.fileName ?? normalized.fileName,
        contentType: put.value.contentType ?? normalized.contentType,
        byteLength: put.value.byteLength,
        parentVersionId: normalized.parentVersionId,
      };

      const written = await docs.put(stored);
      if (!written.ok) {
        throw new Error(written.error.message ?? written.error.title);
      }

      const selected = await kv.get<string>(SELECTED_KEY);
      if (!selected.ok) {
        throw new Error(selected.error.message ?? selected.error.title);
      }
      if (!selected.value) {
        const mark = await kv.set(SELECTED_KEY, stored.id);
        if (!mark.ok) {
          throw new Error(mark.error.message ?? mark.error.title);
        }
      }

      return stored;
    },

    async list() {
      const listed = await docs.list();
      if (!listed.ok) {
        throw new Error(listed.error.message ?? listed.error.title);
      }
      return [...listed.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async get(id: string) {
      const row = await docs.get(id);
      if (!row.ok) {
        throw new Error(row.error.message ?? row.error.title);
      }
      return row.value;
    },

    async getSelected() {
      const selected = await kv.get<string>(SELECTED_KEY);
      if (!selected.ok) {
        throw new Error(selected.error.message ?? selected.error.title);
      }
      if (!selected.value) {
        return undefined;
      }
      return this.get(selected.value);
    },

    async select(resumeId: string) {
      const version = await this.get(resumeId);
      if (!version) {
        throw new Error("That resume version is not in your library. Pick another and try again.");
      }
      const mark = await kv.set(SELECTED_KEY, version.id);
      if (!mark.ok) {
        throw new Error(mark.error.message ?? mark.error.title);
      }
      return version;
    },
  };
}
