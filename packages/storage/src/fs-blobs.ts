import type { BlobStore } from "./interfaces.js";
import { createIoBlobStore } from "./io-blobs.js";
import { createNodeFsIo } from "./node-fs-io.js";
import type { StorageLayout } from "./path-layout.js";

/** Node filesystem blobs — prefer createIoBlobStore for injectable IO. */
export function createFsBlobStore(layout: StorageLayout): BlobStore {
  return createIoBlobStore(layout, createNodeFsIo());
}
