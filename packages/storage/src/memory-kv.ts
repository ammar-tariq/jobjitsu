import { ok, type Result } from "@jobjitsu/core";
import type { KvStore, StorageKey } from "./interfaces.js";

/**
 * Process-local KV for tests / host boot when FS is unavailable.
 * Still on-device — no network.
 */
export function createMemoryKvStore(): KvStore {
  const docs = new Map<string, unknown>();

  const keyOf = (key: StorageKey) => `${key.namespace}::${key.id}`;

  return {
    async get<T>(key: StorageKey): Promise<Result<T | undefined>> {
      return ok(docs.get(keyOf(key)) as T | undefined);
    },
    async set<T>(key: StorageKey, value: T): Promise<Result<void>> {
      docs.set(keyOf(key), value);
      return ok(undefined);
    },
    async delete(key: StorageKey): Promise<Result<void>> {
      docs.delete(keyOf(key));
      return ok(undefined);
    },
    async list(namespace: string): Promise<Result<readonly string[]>> {
      const prefix = `${namespace}::`;
      const ids = [...docs.keys()]
        .filter((k) => k.startsWith(prefix))
        .map((k) => k.slice(prefix.length))
        .sort();
      return ok(ids);
    },
  };
}
