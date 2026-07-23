import { createEntityId } from "@jobjitsu/shared";
import type { Profile, ProfilePatch, ProfileRepository } from "./types.js";

/**
 * Process-local multi-profile repository for host boot / UI tests.
 * On-device only — no network and no `@jobjitsu/storage` FS imports (browser-safe).
 */
export function createMemoryProfileRepository(): ProfileRepository {
  const profiles = new Map<string, Profile>();
  let selectedId: string | undefined;

  function sortProfiles(): Profile[] {
    return [...profiles.values()].sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  function createFromPatch(patch: ProfilePatch): Profile {
    const displayName = (patch.displayName ?? "").trim();
    if (!displayName) {
      throw new Error("Display name is required.");
    }
    const next: Profile = {
      id: createEntityId("profile") as string,
      displayName,
      email: normalizeOptional(patch.email),
      location: normalizeOptional(patch.location),
      updatedAt: new Date().toISOString(),
    };
    profiles.set(next.id, next);
    selectedId ??= next.id;
    return next;
  }

  return {
    async list() {
      return sortProfiles();
    },

    async getById(id: string) {
      return profiles.get(id);
    },

    async get() {
      if (selectedId) {
        const selected = profiles.get(selectedId);
        if (selected) {
          return selected;
        }
      }
      return sortProfiles()[0];
    },

    async select(profileId: string) {
      const profile = profiles.get(profileId);
      if (!profile) {
        throw new Error("That profile is not on this device. Pick another and try again.");
      }
      selectedId = profile.id;
      return profile;
    },

    async upsert(patch: ProfilePatch) {
      if (patch.createNew === true) {
        return createFromPatch(patch);
      }

      const explicitId = patch.id?.trim();
      if (explicitId) {
        const existing = profiles.get(explicitId);
        const displayName = (patch.displayName ?? existing?.displayName ?? "").trim();
        if (!displayName) {
          throw new Error("Display name is required.");
        }
        const next: Profile = {
          id: explicitId,
          displayName,
          email: normalizeOptional(patch.email !== undefined ? patch.email : existing?.email),
          location: normalizeOptional(
            patch.location !== undefined ? patch.location : existing?.location,
          ),
          updatedAt: new Date().toISOString(),
        };
        profiles.set(next.id, next);
        selectedId ??= next.id;
        return next;
      }

      if (profiles.size === 0) {
        return createFromPatch(patch);
      }

      const targetId = selectedId ?? sortProfiles()[0]!.id;
      const existing = profiles.get(targetId);
      if (!existing) {
        return createFromPatch(patch);
      }

      const displayName = (patch.displayName ?? existing.displayName).trim();
      if (!displayName) {
        throw new Error("Display name is required.");
      }
      const next: Profile = {
        ...existing,
        displayName,
        email: normalizeOptional(patch.email !== undefined ? patch.email : existing.email),
        location: normalizeOptional(
          patch.location !== undefined ? patch.location : existing.location,
        ),
        updatedAt: new Date().toISOString(),
      };
      profiles.set(next.id, next);
      selectedId ??= next.id;
      return next;
    },
  };
}

function normalizeOptional(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
