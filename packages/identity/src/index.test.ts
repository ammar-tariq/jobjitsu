import { describe, expect, it } from "vitest";
import {
  FAKE_RESUME_ID,
  PACKAGE_NAME,
  createDefaultFakeResume,
  createFakeResumeStore,
} from "./index.js";

describe("@jobjitsu/identity fake resume", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/identity");
  });

  it("seeds an in-memory résumé without network", async () => {
    const store = createFakeResumeStore();
    const resume = await store.getResume();
    expect(resume?.id).toBe(FAKE_RESUME_ID);
    expect(resume?.fullName).toBe("Alex Rivera");
    expect(resume?.sections.length).toBeGreaterThan(0);

    const profile = await store.getProfile();
    expect(profile?.displayName).toBe("Alex Rivera");
    expect(profile?.location).toMatch(/device/i);
  });

  it("persists updates in memory", async () => {
    const store = createFakeResumeStore({
      resume: createDefaultFakeResume({ fullName: "Sam Chen" }),
    });
    const saved = await store.saveResume(
      createDefaultFakeResume({
        fullName: "Sam Chen",
        summary: "Updated summary",
      }),
    );
    expect(saved.summary).toBe("Updated summary");
    expect((await store.getResume())?.fullName).toBe("Sam Chen");
  });
});
