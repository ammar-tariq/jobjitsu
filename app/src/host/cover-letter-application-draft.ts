import type { AiProvider, ContextAssembler } from "@jobjitsu/ai";
import {
  updateApplicationDraft,
  type Application,
  type ApplicationRepository,
} from "@jobjitsu/applications";
import type { EventBus } from "@jobjitsu/events";
import type { ApplicationId } from "@jobjitsu/shared";

export type CoverLetterApplicationDraftRequest = {
  readonly applicationId: ApplicationId;
  readonly resumeExcerpts?: readonly string[];
  readonly tonePreferences?: string;
};

export type CoverLetterApplicationDraftResult = {
  readonly application: Application | null;
  readonly draftText: string;
  readonly coverLetterStatus: "ready" | "unavailable" | "failed";
};

/**
 * Host-only cover letter draft — UI never imports `@jobjitsu/ai`.
 * Produces an editable draft; never sends or enqueues.
 */
export async function generateApplicationCoverLetterWithAi(options: {
  readonly ai: AiProvider;
  readonly assembler: ContextAssembler;
  readonly repository: ApplicationRepository;
  readonly bus?: EventBus;
  readonly input: CoverLetterApplicationDraftRequest;
}): Promise<CoverLetterApplicationDraftResult> {
  const existing = await options.repository.get(options.input.applicationId);
  if (!existing) {
    return { application: null, draftText: "", coverLetterStatus: "failed" };
  }

  const health = await options.ai.health();
  if (health.status !== "ready") {
    return {
      application: existing,
      draftText: existing.coverLetterDraftText ?? "",
      coverLetterStatus: "unavailable",
    };
  }

  const roleDescription = [
    existing.companyName,
    existing.roleTitle,
    existing.sourceUrl,
    existing.notes,
  ]
    .filter(Boolean)
    .join(" · ");

  const excerpts =
    options.input.resumeExcerpts && options.input.resumeExcerpts.length > 0
      ? options.input.resumeExcerpts
      : [
          existing.resumeDraftText,
          existing.notes,
          `${existing.companyName} — ${existing.roleTitle}`,
        ].filter((part): part is string => Boolean(part && part.trim()));

  const prompt = options.assembler.assemble({
    role: "cover_letter",
    resumeExcerpts: excerpts,
    roleDescription,
    tonePreferences: options.input.tonePreferences,
    draftExcerpt: existing.coverLetterDraftText,
  });

  try {
    const completion = await options.ai.complete({
      role: "cover_letter",
      prompt,
    });
    const draftText = completion.text.trim();
    if (!draftText) {
      return { application: existing, draftText: "", coverLetterStatus: "failed" };
    }

    const updated = await updateApplicationDraft({
      repository: options.repository,
      bus: options.bus,
      patch: {
        id: existing.id,
        coverLetterDraftText: draftText,
        stage: "tailor",
      },
    });

    return {
      application: updated.application,
      draftText,
      coverLetterStatus: "ready",
    };
  } catch {
    return {
      application: existing,
      draftText: existing.coverLetterDraftText ?? "",
      coverLetterStatus: "failed",
    };
  }
}
