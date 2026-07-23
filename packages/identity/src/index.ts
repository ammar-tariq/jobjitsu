/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/identity" as const;

export type * from "./types.js";
export { FAKE_RESUME_ID, createDefaultFakeResume, createFakeResumeStore } from "./fake-resume.js";
export type { FakeResumeStoreOptions } from "./fake-resume.js";
export {
  PROFILE_STORAGE_KEY,
  PROFILES_STORAGE_KEY,
  createKvProfileRepository,
} from "./profile-repository.js";
export { createMemoryProfileRepository } from "./memory-profile-repository.js";
export { createMemoryResumeLibrary, normalizeResumeImport } from "./memory-resume-library.js";
export { createMemoryPathLibrary } from "./memory-path-library.js";
export { createLocalResumeStore } from "./local-resume-store.js";
