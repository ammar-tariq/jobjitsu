import { describe, expect, it } from "vitest";
import { createFakeAiProvider } from "@jobjitsu/ai";
import { createHostRuntime } from "./runtime.js";
import { configureStubLocalModel } from "./test-local-model.js";

describe("createHostRuntime", () => {
  it("runs Agent readiness without outbound send", async () => {
    const host = createHostRuntime({ version: "test" });
    await configureStubLocalModel(host.preferences);
    const names: string[] = [];
    host.bus.subscribeAll((e) => {
      names.push(e.name);
    });

    await host.start();

    expect(names).toContain("App.Started");
    expect(names).toContain("Plugin.Loaded");
    expect(names).toContain("Ai.LocalModelLoading");
    expect(names).toContain("Ai.LocalModelReady");
    expect(names).not.toContain("Resume.Generated");
    expect(names).not.toContain("Email.Synced");

    const order = ["App.Started", "Plugin.Loaded", "Ai.LocalModelReady"] as const;
    const indexes = order.map((name) => names.indexOf(name));
    expect(indexes.every((i) => i >= 0)).toBe(true);
    expect(indexes[0]).toBeLessThan(indexes[1]!);
    expect(indexes[1]).toBeLessThan(indexes[2]!);
  });

  it("fails readiness when local model path is missing — recovery points to Preferences", async () => {
    const host = createHostRuntime({ version: "test" });
    const names: string[] = [];
    host.bus.subscribeAll((e) => {
      names.push(e.name);
    });

    await host.start();

    expect(names).toContain("Ai.LocalModelLoading");
    expect(names).toContain("Ai.LocalModelFailed");
    expect(names).not.toContain("Ai.LocalModelReady");
    expect(names).not.toContain("Resume.Generated");
    expect(host.getActivity().some((e) => /Preferences/i.test(e.summary))).toBe(true);
    expect(await host.bridge.getAiStatus()).toMatchObject({
      ok: true,
      value: { ready: false, locality: "unavailable" },
    });
  });

  it("emits Ai.LocalModelFailed without silent remote fallback", async () => {
    const originalFetch = globalThis.fetch;
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls += 1;
      throw new Error("unexpected network during local model failure");
    }) as typeof fetch;

    try {
      const host = createHostRuntime({
        version: "test",
        ai: createFakeAiProvider({
          id: "fake-unavailable",
          healthStatus: "unavailable",
          locality: "local",
        }),
      });
      await configureStubLocalModel(host.preferences);
      const names: string[] = [];
      host.bus.subscribeAll((e) => {
        names.push(e.name);
      });

      await host.start();

      expect(names).toContain("Ai.LocalModelLoading");
      expect(names).toContain("Ai.LocalModelFailed");
      expect(names).not.toContain("Ai.LocalModelReady");
      expect(names).not.toContain("Resume.Generated");
      expect(fetchCalls).toBe(0);
      expect(await host.bridge.getAiStatus()).toMatchObject({
        ok: true,
        value: { ready: false, locality: "unavailable" },
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("rechecks readiness after saving a model path without loading weights at launch", async () => {
    const host = createHostRuntime({ version: "test" });
    await host.start();
    expect(await host.bridge.getAiStatus()).toMatchObject({
      ok: true,
      value: { ready: false },
    });

    const saved = await host.bridge.setLocalModelPath("/models/jobjitsu-stub.gguf");
    expect(saved.ok).toBe(true);

    expect(await host.bridge.getAiStatus()).toMatchObject({
      ok: true,
      value: { ready: true, locality: "local" },
    });
  });

  it("does not return mailbox OAuth tokens over IPC", async () => {
    const host = createHostRuntime({ version: "test" });
    const result = await host.ipc.invoke("mailbox.connectProvider", {
      provider: "gmail",
      accessToken: "secret-token",
      refreshToken: "refresh-secret",
      emailAddress: "you@gmail.com",
    });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("secret-token");
    expect(serialized).not.toContain("refresh-secret");
    expect(result.ok).toBe(true);
  });

  it("does not return mailbox OAuth tokens when Gmail connect starts", async () => {
    const host = createHostRuntime({ version: "test" });
    const started = await host.bridge.beginMailboxConnect("gmail");
    expect(started.ok).toBe(true);
    if (started.ok) {
      expect(started.value.status).toBe("needs_client_id");
      expect(JSON.stringify(started.value)).not.toMatch(/access_token|refresh_token/i);
    }
  });
});
