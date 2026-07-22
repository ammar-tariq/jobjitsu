import type { StorageProvider } from "./interfaces.js";
import { createIoBlobStore } from "./io-blobs.js";
import { createIoKvStore } from "./io-kv.js";
import type { LocalFsIo } from "./local-fs-io.js";
import { resolveStorageLayout } from "./path-layout.js";

export type CreateIoStorageProviderOptions = {
  readonly dataRoot: string;
  readonly io: LocalFsIo;
  /** When true (default), create kv/ and blobs/ under dataRoot. */
  readonly ensureLayout?: boolean;
};

/**
 * On-device storage provider over injectable filesystem IO.
 * Host wires Node or Tauri IO; shell never imports this with Node FS.
 */
export async function createIoStorageProvider(
  options: CreateIoStorageProviderOptions,
): Promise<StorageProvider> {
  const layout = resolveStorageLayout(options.dataRoot);

  if (options.ensureLayout !== false) {
    await options.io.mkdir(layout.dataRoot);
    await options.io.mkdir(layout.kvRoot);
    await options.io.mkdir(layout.blobsRoot);
  }

  return {
    dataRoot: layout.dataRoot,
    kv: createIoKvStore(layout, options.io),
    blobs: createIoBlobStore(layout, options.io),
  };
}
