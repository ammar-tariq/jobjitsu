import { createEntityId } from "@jobjitsu/shared";
import type { KvStore } from "@jobjitsu/storage";
import type { Profile, ProfilePatch, ProfileRepository } from "./types.js";

export const PROFILE_STORAGE_KEY = {
  namespace: "identity",
  id: "profile",
} as const;

/**
 * Profile repository on local KV — no network, no cloud copy.
 */
export function createKvProfileRepository(kv: KvStore): ProfileRepository {
  return {
    async get() {
      const result = await kv.get<Profile>(PROFILE_STORAGE_KEY);
      if (!result.ok) {
        throw new Error(result.error.message ?? result.error.title);
      }
      return result.value;
    },

    async upsert(patch: ProfilePatch) {
      const existing = await this.get();
      const displayName = (patch.displayName ?? existing?.displayName ?? "").trim();
      if (!displayName) {
        throw new Error("Display name is required.");
      }

      const next: Profile = {
        id: existing?.id ?? (createEntityId("profile") as string),
        displayName,
        email: normalizeOptional(patch.email !== undefined ? patch.email : existing?.email),
        location: normalizeOptional(
          patch.location !== undefined ? patch.location : existing?.location,
        ),
        updatedAt: new Date().toISOString(),
      };

      const written = await kv.set(PROFILE_STORAGE_KEY, next);
      if (!written.ok) {
        throw new Error(written.error.message ?? written.error.title);
      }
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
