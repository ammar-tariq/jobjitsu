import { describe, expect, it, vi } from "vitest";
import {
  buildCraftUserPrompt,
  COVER_LETTER_SYSTEM_PROMPT,
  createOllamaAiProvider,
  systemPromptForRole,
  TAILOR_SYSTEM_PROMPT,
} from "./index.js";

describe("craft prompts", () => {
  it("builds labeled INPUTS with about fallback and plain-text reminder", () => {
    const prompt = buildCraftUserPrompt({
      kind: "resume",
      jobDescription: "Staff Engineer at Acme",
      resumeText: "Sam Chen\nReact Native",
    });
    expect(prompt).toContain("### JOB DESCRIPTION");
    expect(prompt).toContain("Staff Engineer at Acme");
    expect(prompt).toContain("### EXISTING RESUME");
    expect(prompt).toContain("Sam Chen");
    expect(prompt).toContain("Not provided — do not invent company details.");
    expect(prompt).toMatch(/Return ONLY the final tailored resume/i);
    expect(prompt).not.toContain("### WRITING VOICE");
  });

  it("uses cover-letter labels and includes tone when set", () => {
    const prompt = buildCraftUserPrompt({
      kind: "cover_letter",
      jobDescription: "Role",
      resumeText: "Résumé",
      aboutCompany: "Acme builds privacy tools",
      tonePreferences: "calm and precise",
    });
    expect(prompt).toContain("### CANDIDATE RESUME");
    expect(prompt).toContain("Acme builds privacy tools");
    expect(prompt).toContain("### WRITING VOICE");
    expect(prompt).toContain("calm and precise");
  });

  it("exposes the full ATS / cover-letter system prompts", () => {
    expect(systemPromptForRole("tailor")).toBe(TAILOR_SYSTEM_PROMPT);
    expect(systemPromptForRole("cover_letter")).toBe(COVER_LETTER_SYSTEM_PROMPT);
    expect(TAILOR_SYSTEM_PROMPT).toMatch(/Never fabricate experience/i);
    expect(TAILOR_SYSTEM_PROMPT).toContain("# TAILORING PROCESS");
    expect(TAILOR_SYSTEM_PROMPT).toContain("Action + Skill/Tool/Method");
    expect(TAILOR_SYSTEM_PROMPT).toMatch(/plain text/i);
    expect(COVER_LETTER_SYSTEM_PROMPT).toMatch(/250–400 words/i);
    expect(COVER_LETTER_SYSTEM_PROMPT).toContain("# FINAL VALIDATION");
    expect(COVER_LETTER_SYSTEM_PROMPT).toMatch(/Return ONLY the finished cover letter/i);
  });

  it("tailor prompt surfaces buried evidence without re-attributing it", () => {
    expect(TAILOR_SYSTEM_PROMPT).toContain("Experience-gap positioning");
    expect(TAILOR_SYSTEM_PROMPT).toMatch(/hands-on senior practitioner/i);
    expect(TAILOR_SYSTEM_PROMPT).toContain("Surface buried evidence");
    expect(TAILOR_SYSTEM_PROMPT).toMatch(/reordering and emphasis, not re-attribution/i);
    expect(TAILOR_SYSTEM_PROMPT).toContain("Mirror JD phrasing");
    expect(TAILOR_SYSTEM_PROMPT).toContain("PROJECT SPOTLIGHT (conditional)");
    expect(TAILOR_SYSTEM_PROMPT).toMatch(
      /Skip this section entirely when there is no genuine match/i,
    );
    expect(TAILOR_SYSTEM_PROMPT).toContain("# ANTI-PATTERNS");
    expect(TAILOR_SYSTEM_PROMPT).toMatch(/truncate to 1–2 bullets/i);
  });

  it("prompts serve any profession, not just software", () => {
    expect(TAILOR_SYSTEM_PROMPT).toMatch(/never assume a technology career/i);
    expect(TAILOR_SYSTEM_PROMPT).toContain("(Healthcare example)");
    expect(TAILOR_SYSTEM_PROMPT).toContain("Healthcare example:");
    expect(TAILOR_SYSTEM_PROMPT).toMatch(/category names that fit the candidate's field/i);
    expect(COVER_LETTER_SYSTEM_PROMPT).toMatch(/never assume a technology career/i);
    expect(COVER_LETTER_SYSTEM_PROMPT).toMatch(
      /experienced professional in the candidate's own field/i,
    );
    expect(COVER_LETTER_SYSTEM_PROMPT).not.toMatch(/as an experienced software engineer/i);
  });
});

describe("ollama provider uses craft system prompts", () => {
  it("sends the tailor system prompt on complete", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          model: "qwen2.5:3b",
          response: "Tailored résumé draft",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const provider = createOllamaAiProvider({
      getModelId: async () => "qwen2.5:3b",
      fetch: fetchMock as unknown as typeof fetch,
    });

    await provider.complete({
      role: "tailor",
      prompt: buildCraftUserPrompt({
        kind: "resume",
        jobDescription: "Acme",
        resumeText: "Sam",
      }),
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      system: string;
      prompt: string;
    };
    expect(body.system).toBe(TAILOR_SYSTEM_PROMPT);
    expect(body.prompt).toContain("### JOB DESCRIPTION");
  });
});
