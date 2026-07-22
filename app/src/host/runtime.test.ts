import { describe, expect, it } from "vitest";
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
    expect(names).toContain("Resume.Generated");
    expect(names).toContain("Email.Synced");

    const order = ["App.Started", "Plugin.Loaded", "Resume.Generated", "Email.Synced"] as const;
    const indexes = order.map((name) => names.indexOf(name));
    expect(indexes.every((i) => i >= 0)).toBe(true);
    expect(indexes[0]).toBeLessThan(indexes[1]!);
    expect(indexes[1]).toBeLessThan(indexes[2]!);
    expect(indexes[2]).toBeLessThan(indexes[3]!);
  });
});
