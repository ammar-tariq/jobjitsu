import { describe, expect, it } from "vitest";
import {
  PACKAGE_NAME,
  createAiProviderRegistry,
  createFakeAiProvider,
  createFakeContextAssembler,
} from "./index.js";

describe("@jobjitsu/ai fake provider", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/ai");
  });

  it("returns deterministic local health and complete without network", async () => {
    const provider = createFakeAiProvider({ id: "fake-ai" });
    const health = await provider.health();
    expect(health.status).toBe("ready");
    expect(health.locality).toBe("local");
    expect(health.message).toMatch(/fake/i);

    const result = await provider.complete({
      role: "tailor",
      prompt: "Rewrite this bullet for a staff engineer role",
    });
    expect(result.text).toContain("[fake:tailor]");
    expect(result.modelId).toBe("fake-model");
  });

  it("embeds deterministically in-process", async () => {
    const provider = createFakeAiProvider({ embedDimensions: 4 });
    const embedded = await provider.embed?.({ texts: ["hello", "world"] });
    expect(embedded?.dimensions).toBe(4);
    expect(embedded?.vectors).toHaveLength(2);
    expect(embedded?.vectors[0]).toHaveLength(4);
  });

  it("registers providers and exposes the active one", () => {
    const fake = createFakeAiProvider();
    const registry = createAiProviderRegistry([fake]);
    expect(registry.getActive()?.id).toBe("fake-ai");
    expect(registry.list()).toHaveLength(1);
  });

  it("assembles allowlisted context only", () => {
    const assembler = createFakeContextAssembler();
    const prompt = assembler.assemble({
      role: "tailor",
      resumeExcerpts: ["Built APIs"],
      roleDescription: "Staff Engineer",
      tonePreferences: "calm",
    });
    expect(prompt).toContain("resume=Built APIs");
    expect(prompt).not.toContain("timeline");
  });
});
