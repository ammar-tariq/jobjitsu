import { describe, expect, it } from "vitest";
import { CORE_JOB_TYPES, PACKAGE_NAME } from "./index.js";
import type { Scheduler } from "./index.js";

describe("@jobjitsu/scheduler", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/scheduler");
  });

  it("lists core job types without inactivity shame jobs", () => {
    expect(CORE_JOB_TYPES).toContain("followup.due");
    expect(CORE_JOB_TYPES).not.toContain("inactivity.nag");
  });

  it("types Scheduler", () => {
    const keys: Array<keyof Scheduler> = ["arm", "cancel", "registerHandler", "tick"];
    expect(keys).toHaveLength(4);
  });
});
