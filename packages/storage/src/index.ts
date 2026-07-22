/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/storage" as const;

export type * from "./interfaces.js";

export type { LocalFsIo } from "./local-fs-io.js";
export { isNotFoundError } from "./local-fs-io.js";

export {
  BLOBS_DIR,
  CONFIG_DIR,
  KV_DIR,
  STORAGE_APP_DIR,
  assertPathInsideRoot,
  assertSafeStorageSegment,
  joinStoragePath,
  normalizeAbsolutePath,
  parentStoragePath,
  resolveStorageLayout,
  type StorageLayout,
} from "./path-layout.js";

export { createIoKvStore } from "./io-kv.js";
export { createIoBlobStore } from "./io-blobs.js";
export { createIoStorageProvider, type CreateIoStorageProviderOptions } from "./io-provider.js";
export { createDocumentStore } from "./document-store.js";
export { createMemoryKvStore } from "./memory-kv.js";
