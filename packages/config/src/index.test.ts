import { describe, expect, it } from "vitest";
import {
  DEFAULT_APP_SETTINGS,
  PACKAGE_NAME,
  createMemorySettingsStore,
  isInQuietHours,
  requiresApprovalBeforeSend,
} from "./index.js";

describe("@jobjitsu/config", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/config");
  });

  it("defaults to dark theme and approval-before-send", () => {
    expect(DEFAULT_APP_SETTINGS.theme).toBe("dark");
    expect(DEFAULT_APP_SETTINGS.requireApprovalBeforeSend).toBe(true);
    expect(DEFAULT_APP_SETTINGS.notifications.soundEnabled).toBe(false);
    expect(requiresApprovalBeforeSend(DEFAULT_APP_SETTINGS)).toBe(true);
  });

  it("persists patches in memory", async () => {
    const store = createMemorySettingsStore();
    const next = await store.set({ theme: "light" });
    expect(next.theme).toBe("light");
    expect(next.requireApprovalBeforeSend).toBe(true);
    expect((await store.get()).theme).toBe("light");
  });

  it("detects quiet hours across midnight", () => {
    const settings = {
      ...DEFAULT_APP_SETTINGS,
      notifications: {
        soundEnabled: false,
        quietHours: { start: "22:00", end: "07:00" },
      },
    };
    expect(isInQuietHours(settings, new Date(2026, 0, 1, 23, 0))).toBe(true);
    expect(isInQuietHours(settings, new Date(2026, 0, 1, 8, 0))).toBe(false);
  });
});
