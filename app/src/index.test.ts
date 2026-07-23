import { describe, expect, it } from "vitest";
import {
  APP_NAME,
  DEFAULT_SHELL_NAV_ID,
  SHELL_NAV_ITEMS,
  isShellNavId,
  shellPageTitle,
} from "./index.js";

describe("@jobjitsu/app shell navigation", () => {
  it("exports JobJitsu as the app name", () => {
    expect(APP_NAME).toBe("JobJitsu");
  });

  it("lists primary H1 destinations with TERMINOLOGY nouns", () => {
    expect(SHELL_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Applications",
      "Queue",
      "Follow-ups",
      "Profile",
      "Agent",
      "Preferences",
      "Timeline",
    ]);
  });

  it("defaults to Applications", () => {
    expect(DEFAULT_SHELL_NAV_ID).toBe("applications");
    expect(shellPageTitle("applications")).toBe("Applications");
    expect(shellPageTitle("profile")).toBe("Profile");
    expect(shellPageTitle("preferences")).toBe("Preferences");
  });

  it("narrows known nav ids", () => {
    expect(isShellNavId("queue")).toBe(true);
    expect(isShellNavId("follow-ups")).toBe(true);
    expect(isShellNavId("dojo")).toBe(false);
    expect(isShellNavId("send")).toBe(false);
  });
});
