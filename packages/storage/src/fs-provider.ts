import type { StorageProvider } from "./interfaces.js";
import { createIoStorageProvider } from "./io-provider.js";
import { createNodeFsIo } from "./node-fs-io.js";
import { resolveUserDataRoot, type ResolveUserDataRootOptions } from "./paths.js";

export type CreateFsStorageProviderOptions = ResolveUserDataRootOptions & {
  /** When true (default), create kv/ and blobs/ under dataRoot. */
  readonly ensureLayout?: boolean;
};

/**
 * Local filesystem storage provider — JSON KV + blob files under user-data.
 * Node/host only (uses node:fs). Webview uses createIoStorageProvider + Tauri IO.
 */
export async function createFsStorageProvider(
  options: CreateFsStorageProviderOptions = {},
): Promise<StorageProvider> {
  const dataRoot = resolveUserDataRoot(options);
  return createIoStorageProvider({
    dataRoot,
    io: createNodeFsIo(),
    ensureLayout: options.ensureLayout,
  });
}
