/**
 * Node/host filesystem entry — do not import from the Vite webview shell.
 */
export {
  PACKAGE_NAME,
  BLOBS_DIR,
  CONFIG_DIR,
  KV_DIR,
  STORAGE_APP_DIR,
  assertPathInsideRoot,
  assertSafeStorageSegment,
  createDocumentStore,
  createIoBlobStore,
  createIoKvStore,
  createIoStorageProvider,
  createMemoryKvStore,
  isNotFoundError,
  joinStoragePath,
  normalizeAbsolutePath,
  parentStoragePath,
  resolveStorageLayout,
} from "./index.js";

export type * from "./interfaces.js";
export type { LocalFsIo } from "./local-fs-io.js";
export type { CreateIoStorageProviderOptions } from "./io-provider.js";
export type { StorageLayout } from "./path-layout.js";

export { ensureDir, resolveUserDataRoot, type ResolveUserDataRootOptions } from "./paths.js";
export { createNodeFsIo } from "./node-fs-io.js";
export { createFsKvStore } from "./fs-kv.js";
export { createFsBlobStore } from "./fs-blobs.js";
export { createFsStorageProvider, type CreateFsStorageProviderOptions } from "./fs-provider.js";
