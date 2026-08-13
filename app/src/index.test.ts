import { describe, expect, it } from "vitest";
import {
  APP_NAME,
  DEFAULT_SHELL_NAV_ID,
  SHELL_NAV_GROUPS,
  SHELL_NAV_ITEMS,
  isShellNavId,
  shellPageTitle,
} from "./index.js";

describe("@jobjitsu/app shell navigation", () => {
  it("exports JobJitsu as the app name", () => {
    expect(APP_NAME).toBe("JobJitsu");
  });

  it("groups destinations as Work / You / System per SHELL_IA", () => {
    expect(SHELL_NAV_GROUPS.map((group) => group.label)).toEqual(["Work", "You", "System"]);
    expect(SHELL_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Craft",
      "Applications",
      "Queue",
      "Follow-ups",
      "Profile",
      "Job Mail",
      "Sources",
      "Agent",
      "Timeline",
      "Preferences",
    ]);
  });

  it("defaults to Craft", () => {
    expect(DEFAULT_SHELL_NAV_ID).toBe("craft");
    expect(shellPageTitle("craft")).toBe("Craft");
    expect(shellPageTitle("job-mail")).toBe("Job Mail");
    expect(shellPageTitle("sources")).toBe("Sources");
    expect(shellPageTitle("preferences")).toBe("Preferences");
  });

  it("narrows known nav ids", () => {
    expect(isShellNavId("queue")).toBe(true);
    expect(isShellNavId("job-mail")).toBe(true);
    expect(isShellNavId("sources")).toBe(true);
    expect(isShellNavId("follow-ups")).toBe(true);
    expect(isShellNavId("dojo")).toBe(false);
    expect(isShellNavId("send")).toBe(false);
  });
});
