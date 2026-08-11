import type { AiProvider, ContextAssembler } from "@jobjitsu/ai";
import {
  updateApplicationDraft,
  type Application,
  type ApplicationRepository,
} from "@jobjitsu/applications";
import type { EventBus } from "@jobjitsu/events";
import type { ApplicationId } from "@jobjitsu/shared";

export type TailorApplicationDraftRequest = {
  readonly applicationId: ApplicationId;
  readonly resumeExcerpts?: readonly string[];
  readonly tonePreferences?: string;
};

export type TailorApplicationDraftResult = {
  readonly application: Application | null;
  readonly draftText: string;
  readonly tailorStatus: "ready" | "unavailable" | "failed";
};

/**
 * Host-only résumé tailor — UI never imports `@jobjitsu/ai`.
 * Produces an editable draft; never sends or enqueues.
 */
export async function tailorApplicationDraftWithAi(options: {
  readonly ai: AiProvider;
  readonly assembler: ContextAssembler;
  readonly repository: ApplicationRepository;
  readonly bus?: EventBus;
  readonly input: TailorApplicationDraftRequest;
}): Promise<TailorApplicationDraftResult> {
  const existing = await options.repository.get(options.input.applicationId);
  if (!existing) {
    return { application: null, draftText: "", tailorStatus: "failed" };
  }

  const health = await options.ai.health();
  if (health.status !== "ready") {
    return {
      application: existing,
      draftText: existing.resumeDraftText ?? "",
      tailorStatus: "unavailable",
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
    role: "tailor",
    resumeExcerpts: excerpts,
    roleDescription,
    tonePreferences: options.input.tonePreferences,
    draftExcerpt: existing.resumeDraftText,
  });

  try {
    const completion = await options.ai.complete({
      role: "tailor",
      prompt,
    });
    const draftText = completion.text.trim();
    if (!draftText) {
      return { application: existing, draftText: "", tailorStatus: "failed" };
    }

    const updated = await updateApplicationDraft({
      repository: options.repository,
      bus: options.bus,
      patch: {
        id: existing.id,
        resumeDraftText: draftText,
        stage: "tailor",
      },
    });

    if (options.bus) {
      await options.bus.publish("Application.Tailored", {
        applicationId: updated.application.id,
      });
    }

    return {
      application: updated.application,
      draftText,
      tailorStatus: "ready",
    };
  } catch {
    return {
      application: existing,
      draftText: existing.resumeDraftText ?? "",
      tailorStatus: "failed",
    };
  }
}
