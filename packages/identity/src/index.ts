/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/identity" as const;

export type * from "./types.js";
export { FAKE_RESUME_ID, createDefaultFakeResume, createFakeResumeStore } from "./fake-resume.js";
export type { FakeResumeStoreOptions } from "./fake-resume.js";
export { PROFILE_STORAGE_KEY, createKvProfileRepository } from "./profile-repository.js";
export { createMemoryProfileRepository } from "./memory-profile-repository.js";
export { createLocalResumeStore } from "./local-resume-store.js";
