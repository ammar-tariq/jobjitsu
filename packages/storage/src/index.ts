/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/storage" as const;

export type * from "./interfaces.js";

export {
  assertPathInsideRoot,
  assertSafeStorageSegment,
  BLOBS_DIR,
  ensureDir,
  KV_DIR,
  resolveStorageLayout,
  resolveUserDataRoot,
  STORAGE_APP_DIR,
  type ResolveUserDataRootOptions,
  type StorageLayout,
} from "./paths.js";

export { createFsKvStore } from "./fs-kv.js";
export { createFsBlobStore } from "./fs-blobs.js";
export { createFsStorageProvider, type CreateFsStorageProviderOptions } from "./fs-provider.js";
export { createDocumentStore } from "./document-store.js";
export { createMemoryKvStore } from "./memory-kv.js";
