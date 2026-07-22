import { describe, expect, it } from "vitest";
import { FORBIDDEN_IMPLICIT_EGRESS_CAPS, PACKAGE_NAME, PLUGIN_CAPABILITIES } from "./index.js";
import type { PluginHost, PluginManifest } from "./index.js";

describe("@jobjitsu/plugin-sdk", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/plugin-sdk");
  });

  it("lists capabilities without send.execute", () => {
    expect(PLUGIN_CAPABILITIES).toContain("ai.complete");
    expect(PLUGIN_CAPABILITIES).toContain("send.request");
    expect((PLUGIN_CAPABILITIES as readonly string[]).includes("send.execute")).toBe(false);
    expect(FORBIDDEN_IMPLICIT_EGRESS_CAPS).toContain("send.execute");
  });

  it("types PluginHost and PluginManifest", () => {
    const hostKeys: Array<keyof PluginHost> = [
      "listManifests",
      "isEnabled",
      "enable",
      "disable",
      "getSkill",
      "invoke",
    ];
    expect(hostKeys.length).toBeGreaterThan(0);

    const manifestKeys: Array<keyof PluginManifest> = [
      "id",
      "name",
      "version",
      "capabilities",
      "permissions",
      "entry",
    ];
    expect(manifestKeys).toContain("capabilities");
  });
});
