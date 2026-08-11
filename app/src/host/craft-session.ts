import type { AiProvider, ContextAssembler } from "@jobjitsu/ai";
import type { EventBus } from "@jobjitsu/events";
import {
  generateCraftDraftsWithAi,
  type CraftGenerateKind,
  type CraftGenerateResult,
} from "./craft-generate.js";

export type CraftJobPhase = "checking" | "resume" | "cover_letter" | null;

export type CraftJobStatus = "idle" | "running" | "ready" | "failed" | "unavailable" | "invalid";

export type CraftChatMessage = {
  readonly role: "user" | "assistant";
  readonly content: string;
};

export type CraftJobState = {
  readonly status: CraftJobStatus;
  readonly phase: CraftJobPhase;
  readonly kind: CraftGenerateKind | null;
  readonly message: string | null;
  readonly startedAt: string | null;
};

export type CraftSessionState = {
  readonly resumeText: string;
  readonly jobDescription: string;
  readonly aboutCompany: string;
  readonly resumeDraft: string;
  readonly coverLetterDraft: string;
  readonly saveCompany: string;
  readonly saveRole: string;
  readonly chatTarget: "resume" | "cover_letter";
  readonly chatInput: string;
  readonly chatMessages: readonly CraftChatMessage[];
  readonly job: CraftJobState;
};

export type CraftSessionPatch = {
  readonly resumeText?: string;
  readonly jobDescription?: string;
  readonly aboutCompany?: string;
  readonly resumeDraft?: string;
  readonly coverLetterDraft?: string;
  readonly saveCompany?: string;
  readonly saveRole?: string;
  readonly chatTarget?: "resume" | "cover_letter";
  readonly chatInput?: string;
  readonly chatMessages?: readonly CraftChatMessage[];
};

const IDLE_JOB: CraftJobState = {
  status: "idle",
  phase: null,
  kind: null,
  message: null,
  startedAt: null,
};

export const EMPTY_CRAFT_SESSION: CraftSessionState = {
  resumeText: "",
  jobDescription: "",
  aboutCompany: "",
  resumeDraft: "",
  coverLetterDraft: "",
  saveCompany: "",
  saveRole: "",
  chatTarget: "resume",
  chatInput: "",
  chatMessages: [],
  job: IDLE_JOB,
};

export type CraftSessionStore = {
  get(): CraftSessionState;
  patch(patch: CraftSessionPatch): CraftSessionState;
  /**
   * Start on-device prepare. Continues even if the Craft view unmounts.
   * Returns the running session immediately.
   */
  prepareDrafts(kind: CraftGenerateKind): CraftSessionState;
  subscribe(listener: (session: CraftSessionState) => void): () => void;
};

function phaseMessage(phase: CraftJobPhase, kind: CraftGenerateKind): string {
  switch (phase) {
    case "checking":
      return "Checking Agent on this device…";
    case "resume":
      return "Preparing your résumé draft… Usually under a minute on this device.";
    case "cover_letter":
      return kind === "both"
        ? "Preparing your cover letter… Almost done."
        : "Preparing your cover letter… Usually under a minute on this device.";
    default:
      return "Agent is working on this device…";
  }
}

/**
 * Process-local Craft studio session — sources, drafts, and prepare job.
 * Survives navigation; UI never owns the Agent call.
 */
export function createCraftSessionStore(options: {
  readonly ai: AiProvider;
  readonly assembler: ContextAssembler;
  readonly bus?: EventBus;
}): CraftSessionStore {
  let session: CraftSessionState = EMPTY_CRAFT_SESSION;
  let prepareGeneration = 0;
  const listeners = new Set<(session: CraftSessionState) => void>();

  const emit = (): void => {
    const snapshot = session;
    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  const update = (fn: (prev: CraftSessionState) => CraftSessionState): CraftSessionState => {
    session = fn(session);
    emit();
    return session;
  };

  return {
    get() {
      return session;
    },

    patch(patch) {
      return update((prev) => ({
        ...prev,
        ...patch,
        chatMessages: patch.chatMessages ? [...patch.chatMessages] : prev.chatMessages,
        job: prev.job,
      }));
    },

    prepareDrafts(kind) {
      if (session.job.status === "running") {
        return session;
      }

      const startedAt = new Date().toISOString();
      const generation = ++prepareGeneration;
      const sources = {
        resumeText: session.resumeText,
        jobDescription: session.jobDescription,
        aboutCompany: session.aboutCompany,
      };

      update((prev) => ({
        ...prev,
        job: {
          status: "running",
          phase: "checking",
          kind,
          message: phaseMessage("checking", kind),
          startedAt,
        },
      }));

      void (async () => {
        const taskId = `craft-prepare-${generation}`;
        if (options.bus) {
          await options.bus.publish("Ai.Started", {
            taskId,
            providerId: options.ai.id,
          });
        }

        const setPhase = (phase: CraftJobPhase): void => {
          if (generation !== prepareGeneration) {
            return;
          }
          update((prev) => ({
            ...prev,
            job: {
              status: "running",
              phase,
              kind,
              message: phaseMessage(phase, kind),
              startedAt,
            },
          }));
        };

        const result: CraftGenerateResult = await generateCraftDraftsWithAi({
          ai: options.ai,
          assembler: options.assembler,
          input: {
            kind,
            resumeText: sources.resumeText,
            jobDescription: sources.jobDescription,
            aboutCompany: sources.aboutCompany || undefined,
          },
          onPhase: (phase) => {
            setPhase(phase);
          },
        });

        if (options.bus) {
          await options.bus.publish("Ai.Finished", {
            taskId,
            providerId: options.ai.id,
          });
        }

        if (generation !== prepareGeneration) {
          return;
        }

        if (result.craftStatus === "ready") {
          update((prev) => ({
            ...prev,
            resumeDraft:
              kind === "cover_letter" ? prev.resumeDraft : result.resumeDraft || prev.resumeDraft,
            coverLetterDraft:
              kind === "resume"
                ? prev.coverLetterDraft
                : result.coverLetterDraft || prev.coverLetterDraft,
            job: {
              status: "ready",
              phase: null,
              kind,
              message: "Drafts ready. Edit freely — you remain the author. Nothing was sent.",
              startedAt,
            },
          }));
          return;
        }

        update((prev) => ({
          ...prev,
          job: {
            status: result.craftStatus,
            phase: null,
            kind,
            message:
              result.message ??
              (result.craftStatus === "unavailable"
                ? "Agent is not ready yet. Choose a model in Preferences."
                : "Could not prepare those drafts. Try again when you are ready."),
            startedAt,
          },
        }));
      })().catch(() => {
        if (generation !== prepareGeneration) {
          return;
        }
        update((prev) => ({
          ...prev,
          job: {
            status: "failed",
            phase: null,
            kind,
            message: "Could not prepare those drafts. Try again when you are ready.",
            startedAt,
          },
        }));
      });

      return session;
    },

    subscribe(listener) {
      listeners.add(listener);
      listener(session);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
