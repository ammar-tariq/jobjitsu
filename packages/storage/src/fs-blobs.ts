import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createAppError, createEntityId, err, ok, type BlobId, type Result } from "@jobjitsu/core";
import type { BlobMeta, BlobPutOptions, BlobStore } from "./interfaces.js";
import {
  assertPathInsideRoot,
  assertSafeStorageSegment,
  ensureDir,
  type StorageLayout,
} from "./paths.js";

type StoredBlobMeta = BlobMeta;

function blobDir(layout: StorageLayout, id: string): Result<string> {
  const safe = assertSafeStorageSegment(id, "blobId");
  if (!safe.ok) {
    return safe;
  }
  const dir = join(layout.blobsRoot, safe.value);
  return assertPathInsideRoot(layout.blobsRoot, dir);
}

export function createFsBlobStore(layout: StorageLayout): BlobStore {
  return {
    async put(bytes: Uint8Array, options: BlobPutOptions = {}): Promise<Result<BlobMeta>> {
      const id = createEntityId("blob") as BlobId;
      const dirResult = blobDir(layout, id);
      if (!dirResult.ok) {
        return dirResult;
      }
      const prepared = await ensureDir(dirResult.value);
      if (!prepared.ok) {
        return prepared;
      }

      const meta: StoredBlobMeta = {
        id,
        contentType: options.contentType,
        fileName: options.fileName,
        byteLength: bytes.byteLength,
        createdAt: new Date().toISOString(),
      };

      try {
        await writeFile(join(dirResult.value, "data"), bytes);
        await writeFile(
          join(dirResult.value, "meta.json"),
          `${JSON.stringify(meta, null, 2)}\n`,
          "utf8",
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
        const buf = await readFile(join(dirResult.value, "data"));
        return ok(new Uint8Array(buf));
      } catch (cause) {
        const code = (cause as NodeJS.ErrnoException | undefined)?.code;
        if (code === "ENOENT") {
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
        const raw = await readFile(join(dirResult.value, "meta.json"), "utf8");
        return ok(JSON.parse(raw) as BlobMeta);
      } catch (cause) {
        const code = (cause as NodeJS.ErrnoException | undefined)?.code;
        if (code === "ENOENT") {
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
        await rm(dirResult.value, { recursive: true, force: true });
        return ok(undefined);
      } catch (cause) {
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
