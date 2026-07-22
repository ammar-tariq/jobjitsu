/**
 * Portable filesystem IO for on-device storage.
 * Node and Tauri each supply an implementation — packages stay free of webview APIs.
 */

export type LocalFsIo = {
  mkdir(path: string): Promise<void>;
  readText(path: string): Promise<string>;
  writeText(path: string, contents: string): Promise<void>;
  readBytes(path: string): Promise<Uint8Array>;
  writeBytes(path: string, bytes: Uint8Array): Promise<void>;
  /** Entry names only (files + directories). Missing dir → []. */
  readDir(path: string): Promise<readonly string[]>;
  remove(path: string, options?: { readonly recursive?: boolean }): Promise<void>;
  exists(path: string): Promise<boolean>;
};

/** True when the error means "path does not exist". */
export function isNotFoundError(cause: unknown): boolean {
  if (!cause || typeof cause !== "object") {
    return false;
  }
  const code = (cause as { code?: string }).code;
  if (code === "ENOENT" || code === "NotFound") {
    return true;
  }
  const message = (cause as { message?: string }).message ?? "";
  return /not found|no such file|os error 2/i.test(message);
}
