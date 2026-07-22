import { describe, expect, it } from "vitest";
import { DEFAULT_APP_SETTINGS, PACKAGE_NAME } from "./index.js";
import type { SettingsStore } from "./index.js";

describe("@jobjitsu/preferences", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/preferences");
  });

  it("defaults approval-before-send on and sound off", () => {
    expect(DEFAULT_APP_SETTINGS.requireApprovalBeforeSend).toBe(true);
    expect(DEFAULT_APP_SETTINGS.notifications.soundEnabled).toBe(false);
    expect(DEFAULT_APP_SETTINGS.theme).toBe("dark");
  });

  it("types SettingsStore", () => {
    const keys: Array<keyof SettingsStore> = ["get", "set", "replace"];
    expect(keys).toHaveLength(3);
  });
});
