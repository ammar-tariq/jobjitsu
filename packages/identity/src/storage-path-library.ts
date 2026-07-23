import { createEntityId } from "@jobjitsu/shared";
import { createDocumentStore, type KvStore } from "@jobjitsu/storage";
import type { Path, PathLibrary, PathListOptions, PathPatch } from "./types.js";

const PATH_NAMESPACE = "identity.path";
const SELECTED_KEY = { namespace: "identity", id: "path_selected" } as const;
const DEFAULT_PROFILE_ID = "profile_local";

function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Add a short name for this path.");
  }
  return trimmed;
}

function normalizeNotes(notes: string | undefined): string | undefined {
  if (notes === undefined) {
    return undefined;
  }
  const trimmed = notes.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Path library on local KV — stays on-device.
 * Select updates local selection only — never Send.
 */
export function createStoragePathLibrary(kv: KvStore): PathLibrary {
  const docs = createDocumentStore<Path>(kv, PATH_NAMESPACE);

  return {
    async list(options: PathListOptions = {}) {
      const includeArchived = options.includeArchived === true;
      const listed = await docs.list();
      if (!listed.ok) {
        throw new Error(listed.error.message ?? listed.error.title);
      }
      return [...listed.value]
        .filter((path) => includeArchived || !path.archived)
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    async get(id: string) {
      const row = await docs.get(id);
      if (!row.ok) {
        throw new Error(row.error.message ?? row.error.title);
      }
      return row.value;
    },

    async upsert(patch: PathPatch) {
      const name = normalizeName(patch.name);
      const now = new Date().toISOString();
      const existingId = patch.id?.trim();

      if (existingId) {
        const existing = await this.get(existingId);
        if (!existing) {
          throw new Error("That path is not in your library. Pick another and try again.");
        }
        const next: Path = {
          ...existing,
          name,
          notes: patch.notes !== undefined ? normalizeNotes(patch.notes) : existing.notes,
          archived: patch.archived ?? existing.archived,
          updatedAt: now,
          selectedResumeVersionId:
            patch.selectedResumeVersionId === null
              ? undefined
              : (patch.selectedResumeVersionId ?? existing.selectedResumeVersionId),
        };
        const written = await docs.put(next);
        if (!written.ok) {
          throw new Error(written.error.message ?? written.error.title);
        }
        return next;
      }

      const created: Path = {
        id: createEntityId("path"),
        profileId: (patch.profileId ?? DEFAULT_PROFILE_ID).trim() || DEFAULT_PROFILE_ID,
        name,
        notes: normalizeNotes(patch.notes),
        archived: patch.archived ?? false,
        updatedAt: now,
        selectedResumeVersionId:
          patch.selectedResumeVersionId === null
            ? undefined
            : (patch.selectedResumeVersionId ?? undefined),
      };
      const written = await docs.put(created);
      if (!written.ok) {
        throw new Error(written.error.message ?? written.error.title);
      }

      const selected = await kv.get<string>(SELECTED_KEY);
      if (!selected.ok) {
        throw new Error(selected.error.message ?? selected.error.title);
      }
      if (!selected.value && !created.archived) {
        const mark = await kv.set(SELECTED_KEY, created.id);
        if (!mark.ok) {
          throw new Error(mark.error.message ?? mark.error.title);
        }
      }

      return created;
    },

    async archive(pathId: string) {
      const existing = await this.get(pathId);
      if (!existing) {
        throw new Error("That path is not in your library. Pick another and try again.");
      }
      const archived: Path = {
        ...existing,
        archived: true,
        updatedAt: new Date().toISOString(),
      };
      const written = await docs.put(archived);
      if (!written.ok) {
        throw new Error(written.error.message ?? written.error.title);
      }

      const selected = await kv.get<string>(SELECTED_KEY);
      if (!selected.ok) {
        throw new Error(selected.error.message ?? selected.error.title);
      }
      if (selected.value === archived.id) {
        const cleared = await kv.delete(SELECTED_KEY);
        if (!cleared.ok) {
          throw new Error(cleared.error.message ?? cleared.error.title);
        }
      }

      return archived;
    },

    async getSelected() {
      const selected = await kv.get<string>(SELECTED_KEY);
      if (!selected.ok) {
        throw new Error(selected.error.message ?? selected.error.title);
      }
      if (!selected.value) {
        return undefined;
      }
      return this.get(selected.value);
    },

    async select(pathId: string) {
      const path = await this.get(pathId);
      if (!path) {
        throw new Error("That path is not in your library. Pick another and try again.");
      }
      if (path.archived) {
        throw new Error("That path is archived. Restore or pick another path.");
      }
      const mark = await kv.set(SELECTED_KEY, path.id);
      if (!mark.ok) {
        throw new Error(mark.error.message ?? mark.error.title);
      }
      return path;
    },
  };
}
