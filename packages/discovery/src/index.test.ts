import { describe, expect, it } from "vitest";
import { FAKE_JOBS_SOURCE_ID, PACKAGE_NAME, createFakeJobsSource } from "./index.js";

describe("@jobjitsu/discovery fake jobs", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/discovery");
  });

  it("returns fixture jobs without network", async () => {
    const source = createFakeJobsSource();
    expect(source.id).toBe(FAKE_JOBS_SOURCE_ID);
    const jobs = await source.list();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.every((j) => j.sourceId === FAKE_JOBS_SOURCE_ID)).toBe(true);
    expect(jobs.some((j) => j.title.includes("Engineer"))).toBe(true);
  });
});
