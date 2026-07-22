import type { StorageProvider } from "./interfaces.js";
import { createFsBlobStore } from "./fs-blobs.js";
import { createFsKvStore } from "./fs-kv.js";
import {
  ensureDir,
  resolveStorageLayout,
  resolveUserDataRoot,
  type ResolveUserDataRootOptions,
} from "./paths.js";

export type CreateFsStorageProviderOptions = ResolveUserDataRootOptions & {
  /** When true (default), create kv/ and blobs/ under dataRoot. */
  readonly ensureLayout?: boolean;
};

/**
 * Local filesystem storage provider — JSON KV + blob files under user-data.
 * No network I/O; suitable for temp-dir tests and host composition.
 */
export async function createFsStorageProvider(
  options: CreateFsStorageProviderOptions = {},
): Promise<StorageProvider> {
  const dataRoot = resolveUserDataRoot(options);
  const layout = resolveStorageLayout(dataRoot);

  if (options.ensureLayout !== false) {
    const rootOk = await ensureDir(layout.dataRoot);
    if (!rootOk.ok) {
      throw new Error(rootOk.error.message ?? rootOk.error.title);
    }
    const kvOk = await ensureDir(layout.kvRoot);
    if (!kvOk.ok) {
      throw new Error(kvOk.error.message ?? kvOk.error.title);
    }
    const blobsOk = await ensureDir(layout.blobsRoot);
    if (!blobsOk.ok) {
      throw new Error(blobsOk.error.message ?? blobsOk.error.title);
    }
  }

  return {
    dataRoot: layout.dataRoot,
    kv: createFsKvStore(layout),
    blobs: createFsBlobStore(layout),
  };
}
