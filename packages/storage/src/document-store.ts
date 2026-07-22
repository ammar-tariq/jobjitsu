import type { DocumentStore, KvStore } from "./interfaces.js";

/**
 * Document collection over a KV namespace — ids are opaque strings.
 */
export function createDocumentStore<T extends { readonly id: string }>(
  kv: KvStore,
  namespace: string,
): DocumentStore<T> {
  return {
    async get(id) {
      return kv.get<T>({ namespace, id });
    },
    async put(doc) {
      return kv.set({ namespace, id: doc.id }, doc);
    },
    async delete(id) {
      return kv.delete({ namespace, id });
    },
    async list() {
      const ids = await kv.list(namespace);
      if (!ids.ok) {
        return ids;
      }
      const docs: T[] = [];
      for (const id of ids.value) {
        const row = await kv.get<T>({ namespace, id });
        if (!row.ok) {
          return row;
        }
        if (row.value !== undefined) {
          docs.push(row.value);
        }
      }
      return { ok: true as const, value: docs };
    },
  };
}
