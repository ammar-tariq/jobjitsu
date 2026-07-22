import { createAppError, err, ok, type Result } from "@jobjitsu/core";

export const STORAGE_APP_DIR = "JobJitsu" as const;
export const KV_DIR = "kv" as const;
export const BLOBS_DIR = "blobs" as const;
export const CONFIG_DIR = "config" as const;

export type StorageLayout = {
  readonly dataRoot: string;
  readonly kvRoot: string;
  readonly blobsRoot: string;
};

/** Join path segments for absolute on-device roots (POSIX or Windows). */
export function joinStoragePath(...parts: readonly string[]): string {
  if (parts.length === 0) {
    return "";
  }
  const first = parts[0] ?? "";
  const useWin = /^[A-Za-z]:[\\/]/.test(first) || first.startsWith("\\\\");
  const sep = useWin ? "\\" : "/";
  const normalized = parts
    .flatMap((part) => part.split(/[/\\]+/))
    .filter((part, index) => part.length > 0 || index === 0);
  if (useWin && /^[A-Za-z]:$/.test(normalized[0] ?? "")) {
    const drive = normalized[0] ?? "";
    const rest = normalized.slice(1).join(sep);
    return rest ? `${drive}${sep}${rest}` : `${drive}${sep}`;
  }
  if (first.startsWith("/") && !(normalized[0] ?? "").startsWith("/")) {
    return `/${normalized.join(sep)}`;
  }
  return normalized.join(sep);
}

export function resolveStorageLayout(dataRoot: string): StorageLayout {
  const root = stripTrailingSeparators(dataRoot);
  return {
    dataRoot: root,
    kvRoot: joinStoragePath(root, KV_DIR),
    blobsRoot: joinStoragePath(root, BLOBS_DIR),
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
  const resolvedRoot = normalizeAbsolutePath(root);
  const resolvedCandidate = normalizeAbsolutePath(candidate);
  if (!isAbsolutePath(resolvedCandidate)) {
    return err(
      createAppError("validation", "Path not allowed", {
        message: "Storage paths must be absolute.",
        detail: "path:relative",
      }),
    );
  }
  const sep = resolvedRoot.includes("\\") ? "\\" : "/";
  const prefix = resolvedRoot.endsWith(sep) ? resolvedRoot : `${resolvedRoot}${sep}`;
  if (resolvedCandidate !== resolvedRoot && !resolvedCandidate.startsWith(prefix)) {
    return err(
      createAppError("permission", "Path not allowed", {
        message: "Resolved path escapes the storage root.",
        detail: "path:escape",
      }),
    );
  }
  return ok(resolvedCandidate);
}

export function normalizeAbsolutePath(path: string): string {
  const useWin = /\\/.test(path) || /^[A-Za-z]:/.test(path);
  const sep = useWin ? "\\" : "/";
  const raw = path.replace(/[/\\]+/g, sep);
  const parts = raw.split(sep);
  const out: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") {
      if (out.length === 0) {
        out.push(part);
      }
      continue;
    }
    if (part === "..") {
      if (out.length > 1) {
        out.pop();
      }
      continue;
    }
    out.push(part);
  }
  if (useWin) {
    return out.join(sep);
  }
  const joined = out.join(sep);
  return joined.startsWith("/") ? joined : `/${joined}`;
}

function isAbsolutePath(path: string): boolean {
  return path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path) || path.startsWith("\\\\");
}

function stripTrailingSeparators(path: string): string {
  return path.replace(/[/\\]+$/, "") || path;
}

/** Parent directory of an absolute storage path. */
export function parentStoragePath(path: string): string {
  const normalized = normalizeAbsolutePath(path);
  const sep = normalized.includes("\\") ? "\\" : "/";
  const idx = normalized.lastIndexOf(sep);
  if (idx <= 0) {
    return sep === "\\" ? normalized.slice(0, 3) : "/";
  }
  const parent = normalized.slice(0, idx);
  return parent.length > 0 ? parent : sep;
}
