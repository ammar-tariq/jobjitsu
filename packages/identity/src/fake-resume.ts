import { createEntityId } from "@jobjitsu/shared";
import type { Profile, ResumeDocument, ResumeStore } from "./types.js";

export const FAKE_RESUME_ID = "resume_fake_default" as const;

export function createDefaultFakeResume(overrides: Partial<ResumeDocument> = {}): ResumeDocument {
  const base: ResumeDocument = {
    id: FAKE_RESUME_ID,
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    headline: "Staff Engineer · Local-first systems",
    summary: "Builds calm desktop tools. Prefers leverage over spray-and-pray applications.",
    sections: [
      {
        heading: "Experience",
        body: "Led platform work for privacy-respecting products. TypeScript, Rust host bridges.",
      },
      {
        heading: "Skills",
        body: "TypeScript · Event-driven architecture · Desktop shells · Testing",
      },
    ],
    updatedAt: "2026-07-01T00:00:00.000Z",
  };
  return {
    ...base,
    ...overrides,
    sections: overrides.sections ? [...overrides.sections] : [...base.sections],
  };
}

export type FakeResumeStoreOptions = {
  readonly resume?: ResumeDocument | null;
  readonly profile?: Profile;
};

/**
 * Fake résumé store — in-memory seed only.
 * Does **not** parse PDFs, call cloud OCR, or sync identity off-device.
 */
export function createFakeResumeStore(options: FakeResumeStoreOptions = {}): ResumeStore {
  let resume: ResumeDocument | undefined =
    options.resume === null ? undefined : (options.resume ?? createDefaultFakeResume());
  let profile: Profile | undefined =
    options.profile ??
    (resume
      ? {
          id: createEntityId("profile"),
          displayName: resume.fullName,
          email: resume.email,
          location: "On this device",
          updatedAt: resume.updatedAt,
        }
      : undefined);

  return {
    async getResume() {
      return resume;
    },
    async saveResume(document) {
      resume = {
        ...document,
        id: document.id || createEntityId("resume"),
        updatedAt: new Date().toISOString(),
        sections: [...document.sections],
      };
      return resume;
    },
    async getProfile() {
      return profile;
    },
    async saveProfile(next) {
      profile = {
        ...next,
        id: next.id || createEntityId("profile"),
        updatedAt: new Date().toISOString(),
      };
      return profile;
    },
  };
}
