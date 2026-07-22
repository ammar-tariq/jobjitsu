import { createEntityId } from "@jobjitsu/shared";
import { createDocumentStore, type BlobStore, type KvStore } from "@jobjitsu/storage";
import { normalizeResumeImport } from "./memory-resume-library.js";
import type { ResumeImportInput, ResumeLibrary, ResumeVersion } from "./types.js";

const RESUME_VERSION_NAMESPACE = "identity.resume";

/**
 * Resume Library on local KV + blob store — originals stay on-device.
 */
export function createStorageResumeLibrary(kv: KvStore, blobs: BlobStore): ResumeLibrary {
  const docs = createDocumentStore<ResumeVersion>(kv, RESUME_VERSION_NAMESPACE);

  return {
    async import(input: ResumeImportInput) {
      const normalized = normalizeResumeImport(input);
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
      };

      const written = await docs.put(stored);
      if (!written.ok) {
        throw new Error(written.error.message ?? written.error.title);
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
  };
}
