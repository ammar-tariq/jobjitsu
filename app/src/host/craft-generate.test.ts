import { describe, expect, it, vi } from "vitest";
import { createFakeAiProvider } from "@jobjitsu/ai";
import { generateCraftDraftsWithAi } from "./craft-generate.js";

describe("generateCraftDraftsWithAi (PE28-S01)", () => {
  it("generates résumé and cover letter drafts without sending", async () => {
    const send = vi.fn();
    const complete = vi.fn(async (request: { role: string; prompt: string }) => {
      expect(request.prompt).toContain("### JOB DESCRIPTION");
      expect(request.prompt).toContain("Staff Engineer at Acme");
      expect(request.prompt).toContain("Sam Chen");
      expect(request.prompt).toContain("### COMPANY ABOUT US");
      expect(request.prompt).toContain("Acme builds calm software");
      if (request.role === "tailor") {
        expect(request.prompt).toContain("### EXISTING RÉSUMÉ");
        return { text: "Tailored résumé draft for Acme", modelId: "fake-model" };
      }
      expect(request.prompt).toContain("### CANDIDATE RÉSUMÉ");
      return { text: "Cover letter draft for Acme", modelId: "fake-model" };
    });
    const ai = { ...createFakeAiProvider({ id: "fake-ai" }), send, complete };

    const result = await generateCraftDraftsWithAi({
      ai,
      input: {
        kind: "both",
        resumeText: "Sam Chen\nStaff engineer\nBuilt local tools",
        jobDescription: "Staff Engineer at Acme — platform ownership",
        aboutCompany: "Acme builds calm software",
      },
    });

    expect(result.craftStatus).toBe("ready");
    expect(result.resumeDraft).toMatch(/Tailored résumé draft/i);
    expect(result.coverLetterDraft).toMatch(/Cover letter draft/i);
    expect(send).not.toHaveBeenCalled();
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it("includes writing voice when tone preferences are set", async () => {
    const complete = vi.fn(async () => ({
      text: "Tailored résumé draft",
      modelId: "fake-model",
    }));
    const ai = { ...createFakeAiProvider(), complete };

    await generateCraftDraftsWithAi({
      ai,
      input: {
        kind: "resume",
        resumeText: "Résumé body",
        jobDescription: "Job body",
        tonePreferences: "calm and precise",
      },
    });

    expect(complete.mock.calls[0]?.[0]?.prompt).toContain("### WRITING VOICE");
    expect(complete.mock.calls[0]?.[0]?.prompt).toContain("calm and precise");
  });

  it("returns invalid when résumé or JD is empty", async () => {
    const result = await generateCraftDraftsWithAi({
      ai: createFakeAiProvider(),
      input: { kind: "both", resumeText: "", jobDescription: "Role" },
    });
    expect(result.craftStatus).toBe("invalid");
  });

  it("returns unavailable when Agent is not ready", async () => {
    const result = await generateCraftDraftsWithAi({
      ai: createFakeAiProvider({ healthStatus: "unavailable" }),
      input: {
        kind: "resume",
        resumeText: "Résumé body",
        jobDescription: "Job body",
      },
    });
    expect(result.craftStatus).toBe("unavailable");
  });
});
