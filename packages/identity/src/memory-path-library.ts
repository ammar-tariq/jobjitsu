import { createEntityId } from "@jobjitsu/shared";
import type { Path, PathLibrary, PathListOptions, PathPatch } from "./types.js";

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
 * Process-local Path library for host / UI tests.
 * On-device only — no network and no `@jobjitsu/storage` FS imports (browser-safe).
 */
export function createMemoryPathLibrary(): PathLibrary {
  const paths = new Map<string, Path>();
  let selectedId: string | undefined;

  return {
    async list(options: PathListOptions = {}) {
      const includeArchived = options.includeArchived === true;
      const profileId = options.profileId?.trim();
      return [...paths.values()]
        .filter((path) => includeArchived || !path.archived)
        .filter((path) => !profileId || path.profileId === profileId)
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    async get(id: string) {
      return paths.get(id);
    },

    async upsert(patch: PathPatch) {
      const name = normalizeName(patch.name);
      const now = new Date().toISOString();
      const existingId = patch.id?.trim();

      if (existingId) {
        const existing = paths.get(existingId);
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
        paths.set(next.id, next);
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
      paths.set(created.id, created);
      if (!selectedId && !created.archived) {
        selectedId = created.id;
      }
      return created;
    },

    async archive(pathId: string) {
      const existing = paths.get(pathId);
      if (!existing) {
        throw new Error("That path is not in your library. Pick another and try again.");
      }
      const archived: Path = {
        ...existing,
        archived: true,
        updatedAt: new Date().toISOString(),
      };
      paths.set(archived.id, archived);
      if (selectedId === archived.id) {
        selectedId = undefined;
      }
      return archived;
    },

    async getSelected() {
      return selectedId ? paths.get(selectedId) : undefined;
    },

    async select(pathId: string) {
      const path = paths.get(pathId);
      if (!path) {
        throw new Error("That path is not in your library. Pick another and try again.");
      }
      if (path.archived) {
        throw new Error("That path is archived. Restore or pick another path.");
      }
      selectedId = path.id;
      return path;
    },
  };
}
