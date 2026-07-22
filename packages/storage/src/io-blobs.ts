import { createAppError, createEntityId, err, ok, type BlobId, type Result } from "@jobjitsu/core";
import type { BlobMeta, BlobPutOptions, BlobStore } from "./interfaces.js";
import { isNotFoundError, type LocalFsIo } from "./local-fs-io.js";
import {
  assertPathInsideRoot,
  assertSafeStorageSegment,
  joinStoragePath,
  type StorageLayout,
} from "./path-layout.js";

function blobDir(layout: StorageLayout, id: string): Result<string> {
  const safe = assertSafeStorageSegment(id, "blobId");
  if (!safe.ok) {
    return safe;
  }
  const dir = joinStoragePath(layout.blobsRoot, safe.value);
  return assertPathInsideRoot(layout.blobsRoot, dir);
}

/**
 * Blob store over injectable local filesystem IO (Node or Tauri).
 */
export function createIoBlobStore(layout: StorageLayout, io: LocalFsIo): BlobStore {
  return {
    async put(bytes: Uint8Array, options: BlobPutOptions = {}): Promise<Result<BlobMeta>> {
      const id = createEntityId("blob") as BlobId;
      const dirResult = blobDir(layout, id);
      if (!dirResult.ok) {
        return dirResult;
      }
      const meta: BlobMeta = {
        id,
        contentType: options.contentType,
        fileName: options.fileName,
        byteLength: bytes.byteLength,
        createdAt: new Date().toISOString(),
      };

      try {
        await io.mkdir(dirResult.value);
        await io.writeBytes(joinStoragePath(dirResult.value, "data"), bytes);
        await io.writeText(
          joinStoragePath(dirResult.value, "meta.json"),
          `${JSON.stringify(meta, null, 2)}\n`,
        );
        return ok(meta);
      } catch (cause) {
        return err(
          createAppError("unavailable", "Could not store blob", {
            message: "The on-device blob store could not write those bytes.",
            detail: "blob:put",
            cause,
          }),
        );
      }
    },

    async get(id: BlobId): Promise<Result<Uint8Array | undefined>> {
      const dirResult = blobDir(layout, id);
      if (!dirResult.ok) {
        return dirResult;
      }
      try {
        return ok(await io.readBytes(joinStoragePath(dirResult.value, "data")));
      } catch (cause) {
        if (isNotFoundError(cause)) {
          return ok(undefined);
        }
        return err(
          createAppError("unavailable", "Could not read blob", {
            message: "The on-device blob store could not read those bytes.",
            detail: "blob:get",
            cause,
          }),
        );
      }
    },

    async getMeta(id: BlobId): Promise<Result<BlobMeta | undefined>> {
      const dirResult = blobDir(layout, id);
      if (!dirResult.ok) {
        return dirResult;
      }
      try {
        const raw = await io.readText(joinStoragePath(dirResult.value, "meta.json"));
        return ok(JSON.parse(raw) as BlobMeta);
      } catch (cause) {
        if (isNotFoundError(cause)) {
          return ok(undefined);
        }
        return err(
          createAppError("unavailable", "Could not read blob metadata", {
            message: "The on-device blob store could not read metadata.",
            detail: "blob:getMeta",
            cause,
          }),
        );
      }
    },

    async delete(id: BlobId): Promise<Result<void>> {
      const dirResult = blobDir(layout, id);
      if (!dirResult.ok) {
        return dirResult;
      }
      try {
        await io.remove(dirResult.value, { recursive: true });
        return ok(undefined);
      } catch (cause) {
        if (isNotFoundError(cause)) {
          return ok(undefined);
        }
        return err(
          createAppError("unavailable", "Could not delete blob", {
            message: "The on-device blob store could not delete those bytes.",
            detail: "blob:delete",
            cause,
          }),
        );
      }
    },
  };
}
