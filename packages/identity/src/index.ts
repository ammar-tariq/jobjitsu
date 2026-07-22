/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/identity" as const;

export type * from "./types.js";
export { FAKE_RESUME_ID, createDefaultFakeResume, createFakeResumeStore } from "./fake-resume.js";
export type { FakeResumeStoreOptions } from "./fake-resume.js";
