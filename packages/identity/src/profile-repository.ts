import { createEntityId } from "@jobjitsu/shared";
import type { KvStore } from "@jobjitsu/storage";
import type { Profile, ProfilePatch, ProfileRepository } from "./types.js";

/** Legacy single-profile key — migrated into the multi-profile document. */
export const PROFILE_STORAGE_KEY = {
  namespace: "identity",
  id: "profile",
} as const;

export const PROFILES_STORAGE_KEY = {
  namespace: "identity",
  id: "profiles",
} as const;

type ProfilesDocument = {
  readonly profiles: readonly Profile[];
  readonly selectedId?: string;
};

function normalizeOptional(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sortProfiles(profiles: readonly Profile[]): Profile[] {
  return [...profiles].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/**
 * Profile repository on local KV — multiple identities, no network, no cloud copy.
 * Migrates the legacy single `identity/profile` document on first read.
 */
export function createKvProfileRepository(kv: KvStore): ProfileRepository {
  async function readDoc(): Promise<ProfilesDocument> {
    const multi = await kv.get<ProfilesDocument>(PROFILES_STORAGE_KEY);
    if (!multi.ok) {
      throw new Error(multi.error.message ?? multi.error.title);
    }
    if (multi.value) {
      return {
        profiles: multi.value.profiles ?? [],
        selectedId: multi.value.selectedId,
      };
    }

    const legacy = await kv.get<Profile>(PROFILE_STORAGE_KEY);
    if (!legacy.ok) {
      throw new Error(legacy.error.message ?? legacy.error.title);
    }
    if (legacy.value) {
      const migrated: ProfilesDocument = {
        profiles: [legacy.value],
        selectedId: legacy.value.id,
      };
      const written = await kv.set(PROFILES_STORAGE_KEY, migrated);
      if (!written.ok) {
        throw new Error(written.error.message ?? written.error.title);
      }
      return migrated;
    }

    return { profiles: [] };
  }

  async function writeDoc(doc: ProfilesDocument): Promise<void> {
    const written = await kv.set(PROFILES_STORAGE_KEY, {
      profiles: doc.profiles,
      selectedId: doc.selectedId,
    });
    if (!written.ok) {
      throw new Error(written.error.message ?? written.error.title);
    }
  }

  async function createFromPatch(patch: ProfilePatch, doc: ProfilesDocument): Promise<Profile> {
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
    await writeDoc({
      profiles: sortProfiles([...doc.profiles, next]),
      selectedId: doc.selectedId ?? next.id,
    });
    return next;
  }

  return {
    async list() {
      const doc = await readDoc();
      return sortProfiles(doc.profiles);
    },

    async getById(id: string) {
      const doc = await readDoc();
      return doc.profiles.find((profile) => profile.id === id);
    },

    async get() {
      const doc = await readDoc();
      if (doc.selectedId) {
        const selected = doc.profiles.find((profile) => profile.id === doc.selectedId);
        if (selected) {
          return selected;
        }
      }
      return doc.profiles[0];
    },

    async select(profileId: string) {
      const doc = await readDoc();
      const profile = doc.profiles.find((entry) => entry.id === profileId);
      if (!profile) {
        throw new Error("That profile is not on this device. Pick another and try again.");
      }
      await writeDoc({ profiles: doc.profiles, selectedId: profile.id });
      return profile;
    },

    async upsert(patch: ProfilePatch) {
      const doc = await readDoc();

      if (patch.createNew === true) {
        return createFromPatch(patch, doc);
      }

      const explicitId = patch.id?.trim();
      if (explicitId) {
        const existing = doc.profiles.find((profile) => profile.id === explicitId);
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
        const profiles = existing
          ? sortProfiles(doc.profiles.map((profile) => (profile.id === next.id ? next : profile)))
          : sortProfiles([...doc.profiles, next]);
        await writeDoc({
          profiles,
          selectedId: doc.selectedId ?? next.id,
        });
        return next;
      }

      if (doc.profiles.length === 0) {
        return createFromPatch(patch, doc);
      }

      const targetId = doc.selectedId ?? doc.profiles[0]!.id;
      const existing = doc.profiles.find((profile) => profile.id === targetId);
      if (!existing) {
        return createFromPatch(patch, doc);
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
      await writeDoc({
        profiles: sortProfiles(
          doc.profiles.map((profile) => (profile.id === next.id ? next : profile)),
        ),
        selectedId: doc.selectedId ?? next.id,
      });
      return next;
    },
  };
}
