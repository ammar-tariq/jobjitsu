import { describe, expect, it } from "vitest";
import {
  PACKAGE_NAME,
  createAiProviderRegistry,
  createContextAssembler,
  createFakeAiProvider,
  createFakeContextAssembler,
  createNoopKnowledgeReader,
  createPathGatedAiProvider,
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
    expect(result.text).toContain("Tailored résumé draft");
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

  it("does not silently activate a remote provider over local", () => {
    const local = createFakeAiProvider({ id: "local-ai", locality: "local" });
    const remote = createFakeAiProvider({ id: "remote-ai", locality: "remote" });
    const registry = createAiProviderRegistry([local]);
    registry.register(remote);
    expect(registry.getActive()?.id).toBe("local-ai");
    expect(registry.getActive()?.locality).toBe("local");

    registry.setActive("remote-ai");
    expect(registry.getActive()?.id).toBe("remote-ai");
    expect(registry.getActive()?.locality).toBe("remote");
  });

  it("refuses complete when health is not ready (no cloud fallback)", async () => {
    const provider = createFakeAiProvider({ healthStatus: "unavailable", locality: "local" });
    await expect(
      provider.complete({ role: "generic", prompt: "should not reach a cloud" }),
    ).rejects.toThrow(/Preferences|model path/i);
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

describe("@jobjitsu/ai Context Builder", () => {
  it("orders Profile → Resume → … → Current Job and excludes Timeline dumps", () => {
    const assembler = createContextAssembler();
    const timelineDump =
      "Timeline event Application.Submitted Application.Rejected FollowUp.Due ".repeat(40);
    const prompt = assembler.assemble({
      role: "tailor",
      profileExcerpt: "Alex Example",
      resumeExcerpts: ["Built APIs"],
      projectsExcerpt: "Open-source CLI",
      achievementsExcerpt: "Shipped H1",
      currentJobExcerpt: "Staff Engineer",
      roleDescription: "Platform role",
      tonePreferences: "calm",
      timeline: timelineDump,
      fullHistory: timelineDump,
    } as Parameters<typeof assembler.assemble>[0] & {
      timeline: string;
      fullHistory: string;
    });

    expect(prompt.indexOf("profile=")).toBeLessThan(prompt.indexOf("resume="));
    expect(prompt.indexOf("resume=")).toBeLessThan(prompt.indexOf("projects="));
    expect(prompt.indexOf("projects=")).toBeLessThan(prompt.indexOf("achievements="));
    expect(prompt.indexOf("achievements=")).toBeLessThan(prompt.indexOf("currentJob="));
    expect(prompt).not.toContain("Timeline event");
    expect(prompt).not.toContain(timelineDump.slice(0, 40));
  });

  it("enforces a character budget by task role", () => {
    const assembler = createContextAssembler({
      budgetCharsByRole: { tailor: 80 },
    });
    const prompt = assembler.assemble({
      role: "tailor",
      profileExcerpt: "A".repeat(40),
      resumeExcerpts: ["B".repeat(40)],
      projectsExcerpt: "C".repeat(40),
      achievementsExcerpt: "D".repeat(40),
      currentJobExcerpt: "E".repeat(40),
    });
    const body = prompt.replace(/^role=tailor\n?/, "");
    expect(body.length).toBeLessThanOrEqual(80);
    expect(prompt).toContain("profile=");
    expect(prompt).not.toContain("currentJob=");
  });

  it("allows KnowledgeReader no-op and budgeted knowledge slices", () => {
    const noopPrompt = createContextAssembler({
      knowledgeReader: createNoopKnowledgeReader(),
    }).assemble({
      role: "match_explain",
      resumeExcerpts: ["Skills"],
    });
    expect(noopPrompt).not.toContain("knowledge=");

    const withKnowledge = createContextAssembler({
      knowledgeReader: {
        read({ budgetChars }) {
          return [{ text: "X".repeat(budgetChars + 50) }];
        },
      },
      budgetCharsByRole: { match_explain: 200 },
    }).assemble({
      role: "match_explain",
      resumeExcerpts: ["Skills"],
    });
    expect(withKnowledge).toContain("knowledge=");
    const body = withKnowledge.replace(/^role=match_explain\n?/, "");
    expect(body.length).toBeLessThanOrEqual(200);
  });
});

describe("@jobjitsu/ai path-gated provider", () => {
  it("reports misconfigured when model path is missing — no weight load", async () => {
    const inner = createFakeAiProvider({ id: "inner" });
    const gated = createPathGatedAiProvider({
      inner,
      getLocalModelPath: async () => undefined,
    });
    const health = await gated.health();
    expect(health.status).toBe("misconfigured");
    expect(health.locality).toBe("local");
    expect(health.message).toMatch(/Preferences/i);
    await expect(gated.complete({ role: "generic", prompt: "x" })).rejects.toThrow(/Preferences/i);
  });

  it("defers to inner when a path is configured", async () => {
    const inner = createFakeAiProvider({ id: "inner" });
    const gated = createPathGatedAiProvider({
      inner,
      getLocalModelPath: async () => "/models/stub.gguf",
    });
    const health = await gated.health();
    expect(health.status).toBe("ready");
    const result = await gated.complete({ role: "generic", prompt: "hello" });
    expect(result.text).toContain("[fake:generic]");
  });

  it("fails when pathExists reports missing", async () => {
    const inner = createFakeAiProvider({ id: "inner" });
    const gated = createPathGatedAiProvider({
      inner,
      getLocalModelPath: async () => "/missing/model.gguf",
      pathExists: async () => false,
    });
    const health = await gated.health();
    expect(health.status).toBe("misconfigured");
    expect(health.message).toMatch(/could not be found/i);
  });
});
