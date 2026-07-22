import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createAppError, err, ok, type Result } from "@jobjitsu/core";
import type { KvStore, StorageKey } from "./interfaces.js";
import {
  assertPathInsideRoot,
  assertSafeStorageSegment,
  ensureDir,
  type StorageLayout,
} from "./paths.js";

function kvFilePath(layout: StorageLayout, key: StorageKey): Result<string> {
  const ns = assertSafeStorageSegment(key.namespace, "namespace");
  if (!ns.ok) {
    return ns;
  }
  const id = assertSafeStorageSegment(key.id, "id");
  if (!id.ok) {
    return id;
  }
  const file = join(layout.kvRoot, ns.value, `${id.value}.json`);
  return assertPathInsideRoot(layout.kvRoot, file);
}

export function createFsKvStore(layout: StorageLayout): KvStore {
  return {
    async get<T>(key: StorageKey): Promise<Result<T | undefined>> {
      const path = kvFilePath(layout, key);
      if (!path.ok) {
        return path;
      }
      try {
        const raw = await readFile(path.value, "utf8");
        return ok(JSON.parse(raw) as T);
      } catch (cause) {
        const code = (cause as NodeJS.ErrnoException | undefined)?.code;
        if (code === "ENOENT") {
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
      const dir = join(path.value, "..");
      const prepared = await ensureDir(dir);
      if (!prepared.ok) {
        return prepared;
      }
      try {
        await writeFile(path.value, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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
        await rm(path.value, { force: true });
        return ok(undefined);
      } catch (cause) {
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
      const dir = join(layout.kvRoot, ns.value);
      const inside = assertPathInsideRoot(layout.kvRoot, dir);
      if (!inside.ok) {
        return inside;
      }
      try {
        const entries = await readdir(dir);
        return ok(
          entries
            .filter((name) => name.endsWith(".json"))
            .map((name) => name.slice(0, -".json".length))
            .sort(),
        );
      } catch (cause) {
        const code = (cause as NodeJS.ErrnoException | undefined)?.code;
        if (code === "ENOENT") {
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
