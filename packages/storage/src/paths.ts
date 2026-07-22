import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { createAppError, err, ok, type Result } from "@jobjitsu/core";
import { STORAGE_APP_DIR } from "./path-layout.js";

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

export type ResolveUserDataRootOptions = {
  /** Explicit override (tests / host injection). */
  readonly dataRoot?: string;
  /** Prefer `XDG_DATA_HOME` / `LOCALAPPDATA` / `HOME` when set. */
  readonly env?: NodeJS.ProcessEnv;
  readonly homeDir?: string;
  readonly platform?: NodeJS.Platform;
};

/**
 * Resolve the on-device user-data root for JobJitsu.
 * Never invents a network path — local filesystem only.
 * Node/host only — not for the Vite webview.
 */
export function resolveUserDataRoot(options: ResolveUserDataRootOptions = {}): string {
  if (options.dataRoot) {
    return resolve(options.dataRoot);
  }

  const env = options.env ?? process.env;
  const platform = options.platform ?? process.platform;
  const home = options.homeDir ?? env.HOME ?? env.USERPROFILE ?? homedir();

  if (platform === "darwin") {
    return join(home, "Library", "Application Support", STORAGE_APP_DIR);
  }
  if (platform === "win32") {
    const local = env.LOCALAPPDATA ?? join(home, "AppData", "Local");
    return join(local, STORAGE_APP_DIR);
  }
  const xdg = env.XDG_DATA_HOME ?? join(home, ".local", "share");
  return join(xdg, STORAGE_APP_DIR);
}

export async function ensureDir(path: string): Promise<Result<void>> {
  try {
    await mkdir(path, { recursive: true });
    return ok(undefined);
  } catch (cause) {
    return err(
      createAppError("unavailable", "Could not create storage directory", {
        message: "Check that the app data path is writable.",
        detail: "fs:mkdir",
        cause,
      }),
    );
  }
}
