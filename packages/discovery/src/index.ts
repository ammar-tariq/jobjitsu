/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/discovery" as const;

export type * from "./source.js";
export { FAKE_JOBS_SOURCE_ID, createFakeJobsSource } from "./fake-jobs.js";
export type { FakeJobsSourceOptions } from "./fake-jobs.js";
