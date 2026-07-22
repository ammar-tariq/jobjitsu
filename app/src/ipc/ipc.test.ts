import { describe, expect, it } from "vitest";
import { createMemoryProfileRepository } from "@jobjitsu/identity";
import {
  IPC_ALLOWLIST,
  createHostIpcDispatcher,
  createIpcBridge,
  createIpcDispatcher,
  isIpcCommandName,
} from "./index.js";

describe("IPC allowlist", () => {
  it("exports ping, theme, ai status, and identity profile commands", () => {
    expect(IPC_ALLOWLIST).toEqual([
      "ping",
      "theme.get",
      "theme.set",
      "ai.getStatus",
      "identity.getProfile",
      "identity.setProfile",
    ]);
  });

  it("rejects AI complete as an allowlisted name", () => {
    expect(isIpcCommandName("ai.complete")).toBe(false);
    expect(isIpcCommandName("ai.embed")).toBe(false);
    expect(isIpcCommandName("ping")).toBe(true);
    expect(isIpcCommandName("identity.getProfile")).toBe(true);
  });
});

describe("IPC dispatcher", () => {
  it("fails closed on unknown commands", async () => {
    const dispatcher = createIpcDispatcher();
    const result = await dispatcher.invoke("ai.complete", { prompt: "leak" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("permission");
      expect(result.error.detail).toBe("denied:ai.complete");
    }
  });

  it("returns unavailable when an allowlisted command has no handler", async () => {
    const dispatcher = createIpcDispatcher({});
    const result = await dispatcher.invoke("ping");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("unavailable");
    }
  });
});

describe("typed IPC bridge", () => {
  it("pings the host through the allowlist", async () => {
    const bridge = createIpcBridge(createHostIpcDispatcher());
    const result = await bridge.ping();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ ok: true, service: "jobjitsu-host" });
    }
  });

  it("reads and writes theme stubs", async () => {
    const bridge = createIpcBridge(createHostIpcDispatcher({ initialTheme: "dark" }));
    const before = await bridge.getTheme();
    expect(before.ok && before.value.theme).toBe("dark");

    const after = await bridge.setTheme("light");
    expect(after.ok && after.value.theme).toBe("light");
  });

  it("exposes ai.getStatus without complete", async () => {
    const bridge = createIpcBridge(
      createHostIpcDispatcher({
        aiStatus: { ready: true, locality: "local" },
      }),
    );
    const status = await bridge.getAiStatus();
    expect(status.ok && status.value).toEqual({ ready: true, locality: "local" });

    expect(bridge).not.toHaveProperty("complete");
    expect(Object.keys(bridge).sort()).toEqual([
      "getAiStatus",
      "getProfile",
      "getTheme",
      "ping",
      "setProfile",
      "setTheme",
    ]);
  });

  it("reads and writes profile through identity APIs", async () => {
    const profiles = createMemoryProfileRepository();
    const bridge = createIpcBridge(createHostIpcDispatcher({ profiles }));

    const empty = await bridge.getProfile();
    expect(empty.ok && empty.value.profile).toBeNull();

    const saved = await bridge.setProfile({
      displayName: "Sam Chen",
      email: "sam@example.com",
      location: "On this device",
    });
    expect(saved.ok).toBe(true);
    if (saved.ok) {
      expect(saved.value.profile.displayName).toBe("Sam Chen");
      expect(saved.value.profile.location).toMatch(/device/i);
    }

    const loaded = await bridge.getProfile();
    expect(loaded.ok && loaded.value.profile?.displayName).toBe("Sam Chen");
    expect(await profiles.get()).toEqual(saved.ok ? saved.value.profile : undefined);
  });
});
