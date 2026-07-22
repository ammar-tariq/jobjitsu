import type { StorageLayout } from "./path-layout.js";
import { createIoKvStore } from "./io-kv.js";
import { createNodeFsIo } from "./node-fs-io.js";
import type { KvStore } from "./interfaces.js";

/** Node filesystem KV — prefer createIoKvStore for injectable IO. */
export function createFsKvStore(layout: StorageLayout): KvStore {
  return createIoKvStore(layout, createNodeFsIo());
}
