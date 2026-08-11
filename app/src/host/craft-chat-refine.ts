import type { AiProvider, ContextAssembler } from "@jobjitsu/ai";

export type CraftChatTarget = "resume" | "cover_letter";

export type CraftChatMessage = {
  readonly role: "user" | "assistant";
  readonly content: string;
};

export type CraftChatRefineRequest = {
  readonly message: string;
  readonly target: CraftChatTarget;
  readonly resumeText: string;
  readonly jobDescription: string;
  readonly aboutCompany?: string;
  readonly resumeDraft: string;
  readonly coverLetterDraft: string;
  readonly history?: readonly CraftChatMessage[];
};

export type CraftChatRefineResult = {
  readonly chatStatus: "reply" | "clarify" | "unavailable" | "failed" | "invalid";
  readonly assistantMessage: string;
  readonly clarifyingQuestions: readonly string[];
  readonly resumeDraft: string;
  readonly coverLetterDraft: string;
};

const THIN_RESUME_CHARS = 80;
const THIN_JD_CHARS = 40;

/**
 * Host-side clarify policy — ask before inventing unverifiable facts.
 * Pure function so tests lock the fence without a live model.
 */
export function collectCraftClarifyingQuestions(input: {
  readonly message: string;
  readonly resumeText: string;
  readonly jobDescription: string;
  readonly resumeDraft: string;
  readonly coverLetterDraft: string;
}): string[] {
  const questions: string[] = [];
  const resume = input.resumeText.trim();
  const jd = input.jobDescription.trim();
  const hasDraft = Boolean(input.resumeDraft.trim() || input.coverLetterDraft.trim());

  if (!hasDraft) {
    questions.push(
      "Generate a draft first (or paste text into a draft field), then ask for a focused edit.",
    );
  }
  if (resume.length < THIN_RESUME_CHARS) {
    questions.push("Could you paste a fuller résumé — roles, dates, and a few concrete bullets?");
  }
  if (jd.length < THIN_JD_CHARS) {
    questions.push(
      "Could you share more of the job description (responsibilities or requirements)?",
    );
  }
  if (/\b(invent|make up|fabricate|fake experience)\b/i.test(input.message)) {
    questions.push(
      "I stay with facts from your résumé. Which real experience should we emphasize instead?",
    );
  }
  return questions;
}

/**
 * Host-only Craft chat refine (PE28-S03).
 * May ask clarifying questions; never sends; does not invent employment facts.
 */
export async function refineCraftChatWithAi(options: {
  readonly ai: AiProvider;
  readonly assembler: ContextAssembler;
  readonly input: CraftChatRefineRequest;
}): Promise<CraftChatRefineResult> {
  const message = options.input.message.trim();
  if (!message) {
    return {
      chatStatus: "invalid",
      assistantMessage: "Type a short request to refine the draft.",
      clarifyingQuestions: [],
      resumeDraft: options.input.resumeDraft,
      coverLetterDraft: options.input.coverLetterDraft,
    };
  }

  const clarifying = collectCraftClarifyingQuestions({
    message,
    resumeText: options.input.resumeText,
    jobDescription: options.input.jobDescription,
    resumeDraft: options.input.resumeDraft,
    coverLetterDraft: options.input.coverLetterDraft,
  });
  if (clarifying.length > 0) {
    return {
      chatStatus: "clarify",
      assistantMessage:
        "Before changing the draft, a few details will keep this accurate — nothing was invented or sent.",
      clarifyingQuestions: clarifying,
      resumeDraft: options.input.resumeDraft,
      coverLetterDraft: options.input.coverLetterDraft,
    };
  }

  const health = await options.ai.health();
  if (health.status !== "ready") {
    return {
      chatStatus: "unavailable",
      assistantMessage:
        health.message ?? "Agent is not ready yet. Check Preferences for the on-device model name.",
      clarifyingQuestions: [],
      resumeDraft: options.input.resumeDraft,
      coverLetterDraft: options.input.coverLetterDraft,
    };
  }

  const about = options.input.aboutCompany?.trim();
  const roleDescription = about
    ? `${options.input.jobDescription.trim()}\n\nAbout company: ${about}`
    : options.input.jobDescription.trim();
  const targetDraft =
    options.input.target === "cover_letter"
      ? options.input.coverLetterDraft
      : options.input.resumeDraft;
  const role = options.input.target === "cover_letter" ? "cover_letter" : "tailor";

  const historyBlock = (options.input.history ?? [])
    .slice(-6)
    .map((entry) => `${entry.role}: ${entry.content}`)
    .join("\n");

  const prompt = options.assembler.assemble({
    role,
    resumeExcerpts: [options.input.resumeText.trim()],
    roleDescription,
    draftExcerpt: [
      `target=${options.input.target}`,
      `current_draft:\n${targetDraft}`,
      historyBlock ? `recent_chat:\n${historyBlock}` : "",
      `user_request:\n${message}`,
      "Rules: Stay factual to the résumé. Do not invent employers, titles, or dates. Return the full updated draft only.",
    ]
      .filter(Boolean)
      .join("\n\n"),
  });

  try {
    const completion = await options.ai.complete({ role, prompt });
    const updated = completion.text.trim();
    if (!updated) {
      return {
        chatStatus: "failed",
        assistantMessage: "Could not refine that draft. Try a clearer request.",
        clarifyingQuestions: [],
        resumeDraft: options.input.resumeDraft,
        coverLetterDraft: options.input.coverLetterDraft,
      };
    }

    return {
      chatStatus: "reply",
      assistantMessage:
        "Draft updated from your request. Edit freely — you remain the author. Nothing was sent.",
      clarifyingQuestions: [],
      resumeDraft: options.input.target === "resume" ? updated : options.input.resumeDraft,
      coverLetterDraft:
        options.input.target === "cover_letter" ? updated : options.input.coverLetterDraft,
    };
  } catch {
    return {
      chatStatus: "failed",
      assistantMessage: "Could not refine that draft. Try again when you are ready.",
      clarifyingQuestions: [],
      resumeDraft: options.input.resumeDraft,
      coverLetterDraft: options.input.coverLetterDraft,
    };
  }
}
