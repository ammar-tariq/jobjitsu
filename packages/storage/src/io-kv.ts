import { createAppError, err, ok, type Result } from "@jobjitsu/core";
import type { KvStore, StorageKey } from "./interfaces.js";
import { isNotFoundError, type LocalFsIo } from "./local-fs-io.js";
import {
  assertPathInsideRoot,
  assertSafeStorageSegment,
  joinStoragePath,
  parentStoragePath,
  type StorageLayout,
} from "./path-layout.js";

function kvFilePath(layout: StorageLayout, key: StorageKey): Result<string> {
  const ns = assertSafeStorageSegment(key.namespace, "namespace");
  if (!ns.ok) {
    return ns;
  }
  const id = assertSafeStorageSegment(key.id, "id");
  if (!id.ok) {
    return id;
  }
  const file = joinStoragePath(layout.kvRoot, ns.value, `${id.value}.json`);
  return assertPathInsideRoot(layout.kvRoot, file);
}

/**
 * JSON document KV over injectable local filesystem IO (Node or Tauri).
 */
export function createIoKvStore(layout: StorageLayout, io: LocalFsIo): KvStore {
  return {
    async get<T>(key: StorageKey): Promise<Result<T | undefined>> {
      const path = kvFilePath(layout, key);
      if (!path.ok) {
        return path;
      }
      try {
        // Prefer exists() — Tauri missing-file errors are not always Node-shaped ENOENT.
        if (!(await io.exists(path.value))) {
          return ok(undefined);
        }
        const raw = await io.readText(path.value);
        try {
          return ok(JSON.parse(raw) as T);
        } catch (cause) {
          return err(
            createAppError("unavailable", "Could not read document", {
              message: "The on-device store file could not be parsed.",
              detail: "kv:get:parse",
              cause,
            }),
          );
        }
      } catch (cause) {
        if (isNotFoundError(cause)) {
          return ok(undefined);
        }
        return err(
          createAppError("unavailable", "Could not read document", {
            message: "The on-device store could not be read.",
            detail: "kv:get",
            cause,
          }),
        );
      }
    },

    async set<T>(key: StorageKey, value: T): Promise<Result<void>> {
      const path = kvFilePath(layout, key);
      if (!path.ok) {
        return path;
      }
      const dir = parentStoragePath(path.value);
      try {
        await io.mkdir(dir);
        await io.writeText(path.value, `${JSON.stringify(value, null, 2)}\n`);
        return ok(undefined);
      } catch (cause) {
        return err(
          createAppError("unavailable", "Could not write document", {
            message: "The on-device store could not be written.",
            detail: "kv:set",
            cause,
          }),
        );
      }
    },

    async delete(key: StorageKey): Promise<Result<void>> {
      const path = kvFilePath(layout, key);
      if (!path.ok) {
        return path;
      }
      try {
        await io.remove(path.value);
        return ok(undefined);
      } catch (cause) {
        if (isNotFoundError(cause)) {
          return ok(undefined);
        }
        return err(
          createAppError("unavailable", "Could not delete document", {
            message: "The on-device store could not delete that row.",
            detail: "kv:delete",
            cause,
          }),
        );
      }
    },

    async list(namespace: string): Promise<Result<readonly string[]>> {
      const ns = assertSafeStorageSegment(namespace, "namespace");
      if (!ns.ok) {
        return ns;
      }
      const dir = joinStoragePath(layout.kvRoot, ns.value);
      const inside = assertPathInsideRoot(layout.kvRoot, dir);
      if (!inside.ok) {
        return inside;
      }
      try {
        const entries = await io.readDir(dir);
        return ok(
          entries
            .filter((name) => name.endsWith(".json"))
            .map((name) => name.slice(0, -".json".length))
            .sort(),
        );
      } catch (cause) {
        if (isNotFoundError(cause)) {
          return ok([]);
        }
        return err(
          createAppError("unavailable", "Could not list documents", {
            message: "The on-device store could not list that namespace.",
            detail: "kv:list",
            cause,
          }),
        );
      }
    },
  };
}
