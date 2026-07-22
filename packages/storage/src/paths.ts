import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join, resolve, sep } from "node:path";
import { createAppError, err, ok, type Result } from "@jobjitsu/core";

export const STORAGE_APP_DIR = "JobJitsu" as const;
export const KV_DIR = "kv" as const;
export const BLOBS_DIR = "blobs" as const;

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

export type StorageLayout = {
  readonly dataRoot: string;
  readonly kvRoot: string;
  readonly blobsRoot: string;
};

export function resolveStorageLayout(dataRoot: string): StorageLayout {
  const root = resolve(dataRoot);
  return {
    dataRoot: root,
    kvRoot: join(root, KV_DIR),
    blobsRoot: join(root, BLOBS_DIR),
  };
}

/** Reject path traversal / separator injection in storage key segments. */
export function assertSafeStorageSegment(segment: string, label: string): Result<string> {
  const trimmed = segment.trim();
  if (!trimmed) {
    return err(
      createAppError("validation", "Invalid storage key", {
        message: `${label} must not be empty.`,
        detail: `${label}:empty`,
      }),
    );
  }
  if (trimmed === "." || trimmed === ".." || trimmed.includes("..")) {
    return err(
      createAppError("validation", "Invalid storage key", {
        message: `${label} must not contain path traversal.`,
        detail: `${label}:traversal`,
      }),
    );
  }
  if (trimmed.includes("/") || trimmed.includes("\\") || trimmed.includes("\0")) {
    return err(
      createAppError("validation", "Invalid storage key", {
        message: `${label} must not contain path separators.`,
        detail: `${label}:separator`,
      }),
    );
  }
  return ok(trimmed);
}

/** Ensure `candidate` resolves under `root`. */
export function assertPathInsideRoot(root: string, candidate: string): Result<string> {
  const resolvedRoot = resolve(root);
  const resolvedCandidate = resolve(candidate);
  const prefix = resolvedRoot.endsWith(sep) ? resolvedRoot : `${resolvedRoot}${sep}`;
  if (resolvedCandidate !== resolvedRoot && !resolvedCandidate.startsWith(prefix)) {
    return err(
      createAppError("permission", "Path not allowed", {
        message: "Resolved path escapes the storage root.",
        detail: "path:escape",
      }),
    );
  }
  if (!isAbsolute(resolvedCandidate)) {
    return err(
      createAppError("validation", "Path not allowed", {
        message: "Storage paths must be absolute.",
        detail: "path:relative",
      }),
    );
  }
  return ok(resolvedCandidate);
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
