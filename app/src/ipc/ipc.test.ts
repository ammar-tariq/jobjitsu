import { describe, expect, it } from "vitest";
import {
  IPC_ALLOWLIST,
  createHostIpcDispatcher,
  createIpcBridge,
  createIpcDispatcher,
  isIpcCommandName,
} from "./index.js";

describe("IPC allowlist", () => {
  it("exports ping and W0 stubs only", () => {
    expect(IPC_ALLOWLIST).toEqual(["ping", "theme.get", "theme.set", "ai.getStatus"]);
  });

  it("rejects AI complete as an allowlisted name", () => {
    expect(isIpcCommandName("ai.complete")).toBe(false);
    expect(isIpcCommandName("ai.embed")).toBe(false);
    expect(isIpcCommandName("ping")).toBe(true);
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
    expect(Object.keys(bridge).sort()).toEqual(["getAiStatus", "getTheme", "ping", "setTheme"]);
  });
});
