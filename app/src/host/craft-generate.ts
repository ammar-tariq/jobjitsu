import type { AiProvider, ContextAssembler } from "@jobjitsu/ai";

export type CraftGenerateKind = "resume" | "cover_letter" | "both";

export type CraftGenerateRequest = {
  readonly kind: CraftGenerateKind;
  readonly resumeText: string;
  readonly jobDescription: string;
  readonly aboutCompany?: string;
};

export type CraftGenerateResult = {
  readonly resumeDraft: string;
  readonly coverLetterDraft: string;
  readonly craftStatus: "ready" | "unavailable" | "failed" | "invalid";
  readonly message?: string;
};

export type CraftGeneratePhase = "checking" | "resume" | "cover_letter";

/**
 * Host-only Craft Studio generate (PE28-S01).
 * Produces editable drafts from résumé + JD (+ optional about company).
 * Never sends or enqueues.
 */
export async function generateCraftDraftsWithAi(options: {
  readonly ai: AiProvider;
  readonly assembler: ContextAssembler;
  readonly input: CraftGenerateRequest;
  readonly onPhase?: (phase: CraftGeneratePhase) => void;
}): Promise<CraftGenerateResult> {
  const resumeText = options.input.resumeText.trim();
  const jobDescription = options.input.jobDescription.trim();
  const aboutCompany = options.input.aboutCompany?.trim();

  if (!resumeText || !jobDescription) {
    return {
      resumeDraft: "",
      coverLetterDraft: "",
      craftStatus: "invalid",
      message: "Add your résumé and job description before generating.",
    };
  }

  options.onPhase?.("checking");
  const health = await options.ai.health();
  if (health.status !== "ready") {
    return {
      resumeDraft: "",
      coverLetterDraft: "",
      craftStatus: "unavailable",
      message:
        health.message ?? "Agent is not ready yet. Check Preferences for the on-device model name.",
    };
  }

  const roleDescription = aboutCompany
    ? `${jobDescription}\n\nAbout company: ${aboutCompany}`
    : jobDescription;

  let resumeDraft = "";
  let coverLetterDraft = "";

  try {
    if (options.input.kind === "resume" || options.input.kind === "both") {
      options.onPhase?.("resume");
      const prompt = options.assembler.assemble({
        role: "tailor",
        resumeExcerpts: [resumeText],
        roleDescription,
        draftExcerpt: aboutCompany,
      });
      const completion = await options.ai.complete({ role: "tailor", prompt });
      resumeDraft = completion.text.trim();
      if (!resumeDraft) {
        return {
          resumeDraft: "",
          coverLetterDraft: "",
          craftStatus: "failed",
          message: "Could not prepare that résumé draft. Try again when you are ready.",
        };
      }
    }

    if (options.input.kind === "cover_letter" || options.input.kind === "both") {
      options.onPhase?.("cover_letter");
      const prompt = options.assembler.assemble({
        role: "cover_letter",
        resumeExcerpts: [resumeText],
        roleDescription,
        draftExcerpt: aboutCompany,
      });
      const completion = await options.ai.complete({ role: "cover_letter", prompt });
      coverLetterDraft = completion.text.trim();
      if (!coverLetterDraft) {
        return {
          resumeDraft,
          coverLetterDraft: "",
          craftStatus: "failed",
          message: "Could not prepare that cover letter. Try again when you are ready.",
        };
      }
    }

    return {
      resumeDraft,
      coverLetterDraft,
      craftStatus: "ready",
    };
  } catch {
    return {
      resumeDraft,
      coverLetterDraft,
      craftStatus: "failed",
      message: "Could not prepare those drafts. Try again when you are ready.",
    };
  }
}
