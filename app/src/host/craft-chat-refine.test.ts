import { describe, expect, it, vi } from "vitest";
import { createFakeAiProvider, createFakeContextAssembler } from "@jobjitsu/ai";
import { collectCraftClarifyingQuestions, refineCraftChatWithAi } from "./craft-chat-refine.js";

const richResume = `
Sam Chen
Staff Engineer · 2019–present
- Shipped on-device privacy tools with careful boundaries
- Led platform delivery across product and infrastructure
`.trim();

const richJd = `
Staff Engineer at Acme
Own platform reliability, mentor engineers, ship calm tools for career craft.
`.trim();

const draft = `
Tailored résumé draft
Summary
Experienced builder focused on clarity.
`.trim();

describe("craft chat refine (PE28-S03)", () => {
  it("asks clarifying questions when résumé or JD is thin (no invent)", () => {
    const questions = collectCraftClarifyingQuestions({
      message: "Make it stronger",
      resumeText: "Sam",
      jobDescription: "Job",
      resumeDraft: draft,
      coverLetterDraft: "",
    });
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.join(" ")).toMatch(/fuller résumé|job description/i);
  });

  it("refuses invent requests with a calm clarifying question", () => {
    const questions = collectCraftClarifyingQuestions({
      message: "Please invent two fake employers",
      resumeText: richResume,
      jobDescription: richJd,
      resumeDraft: draft,
      coverLetterDraft: "",
    });
    expect(questions.join(" ")).toMatch(/facts from your résumé/i);
  });

  it("refines a draft via Agent without calling send", async () => {
    const send = vi.fn();
    const ai = { ...createFakeAiProvider({ id: "fake-ai" }), send };

    const result = await refineCraftChatWithAi({
      ai,
      assembler: createFakeContextAssembler(),
      input: {
        message: "Make the summary more systems-focused",
        target: "resume",
        resumeText: richResume,
        jobDescription: richJd,
        resumeDraft: draft,
        coverLetterDraft: "",
      },
    });

    expect(result.chatStatus).toBe("reply");
    expect(result.resumeDraft).toMatch(/Tailored résumé draft/i);
    expect(result.assistantMessage).toMatch(/Nothing was sent/i);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns clarify without calling complete when inputs are thin", async () => {
    const complete = vi.fn();
    const base = createFakeAiProvider();
    const ai = {
      ...base,
      complete: async (request: Parameters<typeof base.complete>[0]) => {
        complete();
        return base.complete(request);
      },
    };

    const result = await refineCraftChatWithAi({
      ai,
      assembler: createFakeContextAssembler(),
      input: {
        message: "Rewrite everything",
        target: "resume",
        resumeText: "x",
        jobDescription: "y",
        resumeDraft: "",
        coverLetterDraft: "",
      },
    });

    expect(result.chatStatus).toBe("clarify");
    expect(result.clarifyingQuestions.length).toBeGreaterThan(0);
    expect(complete).not.toHaveBeenCalled();
  });
});
