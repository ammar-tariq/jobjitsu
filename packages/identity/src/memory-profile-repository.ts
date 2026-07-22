import { createEntityId } from "@jobjitsu/shared";
import type { Profile, ProfilePatch, ProfileRepository } from "./types.js";

/**
 * Process-local profile repository for host boot / UI tests.
 * On-device only — no network and no `@jobjitsu/storage` FS imports (browser-safe).
 */
export function createMemoryProfileRepository(): ProfileRepository {
  let profile: Profile | undefined;

  return {
    async get() {
      return profile;
    },

    async upsert(patch: ProfilePatch) {
      const displayName = (patch.displayName ?? profile?.displayName ?? "").trim();
      if (!displayName) {
        throw new Error("Display name is required.");
      }

      profile = {
        id: profile?.id ?? (createEntityId("profile") as string),
        displayName,
        email: normalizeOptional(patch.email !== undefined ? patch.email : profile?.email),
        location: normalizeOptional(
          patch.location !== undefined ? patch.location : profile?.location,
        ),
        updatedAt: new Date().toISOString(),
      };
      return profile;
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
