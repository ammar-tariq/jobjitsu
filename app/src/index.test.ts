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

  it("lists the desktop shell destinations", () => {
    expect(SHELL_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Dojo",
      "Opportunities",
      "Resume",
      "Inbox",
      "Recruiters",
      "Analytics",
      "Extensions",
      "Settings",
    ]);
  });

  it("defaults to Dojo with Welcome title", () => {
    expect(DEFAULT_SHELL_NAV_ID).toBe("dojo");
    expect(shellPageTitle("dojo")).toBe("Welcome");
    expect(shellPageTitle("settings")).toBe("Settings");
  });

  it("narrows known nav ids", () => {
    expect(isShellNavId("inbox")).toBe(true);
    expect(isShellNavId("send")).toBe(false);
  });
});
