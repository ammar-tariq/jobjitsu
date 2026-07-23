import { describe, expect, it } from "vitest";
import { createFakeAiProvider } from "@jobjitsu/ai";
import { createHostRuntime } from "./runtime.js";

describe("createHostRuntime", () => {
  it("runs the event cascade without UI calling AI", async () => {
    const host = createHostRuntime({ version: "test" });
    const names: string[] = [];
    host.bus.subscribeAll((e) => {
      names.push(e.name);
    });

    await host.start();

    expect(names).toContain("App.Started");
    expect(names).toContain("Plugin.Loaded");
    expect(names).toContain("Ai.LocalModelLoading");
    expect(names).toContain("Ai.LocalModelReady");
    expect(names).toContain("Resume.Generated");
    expect(names).toContain("Email.Synced");

    const order = [
      "App.Started",
      "Plugin.Loaded",
      "Ai.LocalModelReady",
      "Resume.Generated",
      "Email.Synced",
    ] as const;
    const indexes = order.map((name) => names.indexOf(name));
    expect(indexes.every((i) => i >= 0)).toBe(true);
    expect(indexes[0]).toBeLessThan(indexes[1]!);
    expect(indexes[1]).toBeLessThan(indexes[2]!);
    expect(indexes[2]).toBeLessThan(indexes[3]!);
    expect(indexes[3]).toBeLessThan(indexes[4]!);
  });

  it("emits Ai.LocalModelFailed without silent remote fallback", async () => {
    const host = createHostRuntime({
      version: "test",
      ai: createFakeAiProvider({
        id: "fake-unavailable",
        healthStatus: "unavailable",
        locality: "local",
      }),
    });
    const names: string[] = [];
    host.bus.subscribeAll((e) => {
      names.push(e.name);
    });

    await host.start();

    expect(names).toContain("Ai.LocalModelLoading");
    expect(names).toContain("Ai.LocalModelFailed");
    expect(names).not.toContain("Ai.LocalModelReady");
    expect(names).not.toContain("Resume.Generated");
    expect(await host.bridge.getAiStatus()).toMatchObject({
      ok: true,
      value: { ready: false, locality: "unavailable" },
    });
  });
});
