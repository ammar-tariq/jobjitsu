import { createEntityId } from "@jobjitsu/shared";
import type { KvStore } from "@jobjitsu/storage";
import { createKvProfileRepository } from "./profile-repository.js";
import type { Profile, ResumeDocument, ResumeStore } from "./types.js";

const RESUME_KEY = { namespace: "identity", id: "resume_active" } as const;

/**
 * Local résumé + profile store backed by on-device KV.
 * Public identity APIs — UI must not talk to storage directly.
 */
export function createLocalResumeStore(kv: KvStore): ResumeStore {
  const profiles = createKvProfileRepository(kv);

  return {
    async getResume() {
      const result = await kv.get<ResumeDocument>(RESUME_KEY);
      if (!result.ok) {
        throw new Error(result.error.message ?? result.error.title);
      }
      return result.value;
    },

    async saveResume(document) {
      const next: ResumeDocument = {
        ...document,
        id: document.id || createEntityId("resume"),
        updatedAt: new Date().toISOString(),
        sections: [...document.sections],
      };
      const written = await kv.set(RESUME_KEY, next);
      if (!written.ok) {
        throw new Error(written.error.message ?? written.error.title);
      }
      return next;
    },

    async getProfile() {
      return profiles.get();
    },

    async saveProfile(profile: Profile) {
      return profiles.upsert({
        id: profile.id,
        displayName: profile.displayName,
        email: profile.email,
        location: profile.location,
      });
    },
  };
}
