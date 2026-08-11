import { describe, expect, it, vi } from "vitest";
import { createFakeAiProvider, createFakeContextAssembler } from "@jobjitsu/ai";
import { generateCraftDraftsWithAi } from "./craft-generate.js";

describe("generateCraftDraftsWithAi (PE28-S01)", () => {
  it("generates résumé and cover letter drafts without sending", async () => {
    const send = vi.fn();
    const ai = { ...createFakeAiProvider({ id: "fake-ai" }), send };

    const result = await generateCraftDraftsWithAi({
      ai,
      assembler: createFakeContextAssembler(),
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
  });

  it("returns invalid when résumé or JD is empty", async () => {
    const result = await generateCraftDraftsWithAi({
      ai: createFakeAiProvider(),
      assembler: createFakeContextAssembler(),
      input: { kind: "both", resumeText: "", jobDescription: "Role" },
    });
    expect(result.craftStatus).toBe("invalid");
  });

  it("returns unavailable when Agent is not ready", async () => {
    const result = await generateCraftDraftsWithAi({
      ai: createFakeAiProvider({ healthStatus: "unavailable" }),
      assembler: createFakeContextAssembler(),
      input: {
        kind: "resume",
        resumeText: "Résumé body",
        jobDescription: "Job body",
      },
    });
    expect(result.craftStatus).toBe("unavailable");
  });
});
