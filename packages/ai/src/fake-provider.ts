import type {
  AiCompleteRequest,
  AiCompleteResult,
  AiEmbedRequest,
  AiEmbedResult,
  AiHealth,
  AiProvider,
  AiProviderRegistry,
  ContextAssembler,
  ContextAssemblerInput,
} from "./provider.js";

export type FakeAiProviderOptions = {
  readonly id?: string;
  /** Override complete text; default is deterministic from role + prompt length. */
  readonly completeText?: string | ((request: AiCompleteRequest) => string);
  readonly healthStatus?: AiHealth["status"];
  /** Default local — remote is for honesty tests only. */
  readonly locality?: AiHealth["locality"];
  readonly embedDimensions?: number;
};

/**
 * In-process fake AI — no Ollama, no network, no model files.
 * Suitable for unit tests and Desktop Foundation demos.
 */
export function createFakeAiProvider(options: FakeAiProviderOptions = {}): AiProvider {
  const id = options.id ?? "fake-ai";
  const dimensions = options.embedDimensions ?? 8;
  const locality = options.locality ?? "local";

  return {
    id,
    locality,
    async health(): Promise<AiHealth> {
      return {
        status: options.healthStatus ?? "ready",
        locality,
        providerId: id,
        message:
          locality === "local"
            ? "Fake on-device provider (not a real model)"
            : "Fake remote provider (honesty tests)",
      };
    },
    async complete(request: AiCompleteRequest): Promise<AiCompleteResult> {
      const status = options.healthStatus ?? "ready";
      if (status !== "ready") {
        throw new Error(
          "Agent didn’t start. Confirm the model path in Preferences. Nothing left this machine.",
        );
      }
      if (typeof options.completeText === "function") {
        return { text: options.completeText(request), modelId: "fake-model" };
      }
      if (options.completeText !== undefined) {
        return { text: options.completeText, modelId: "fake-model" };
      }
      if (request.role === "parse_assist") {
        // Deterministic import pre-fill for tests/demo — no network.
        const email = request.prompt.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
        const heading =
          request.prompt.match(/#\s+([^\n|#]+)/)?.[1]?.trim() ??
          request.prompt.match(/\bName:\s*([^\n]+)/i)?.[1]?.trim() ??
          "";
        return {
          text: JSON.stringify({
            contactName: heading,
            contactEmail: email,
            notes: "",
          }),
          modelId: "fake-model",
        };
      }
      if (request.role === "tailor") {
        const listing = request.prompt.match(/listing=([^\n]+)/)?.[1]?.trim() ?? "this role";
        return {
          text: [
            "Tailored résumé draft (on this device)",
            "",
            `For: ${listing}`,
            "",
            "Summary",
            "Experienced builder focused on clarity, ownership, and calm delivery.",
            "",
            "Selected experience",
            "- Shipped on-device tools with careful privacy boundaries",
            "- Collaborated across product and platform without spray-and-pray volume",
            "",
            "Edit freely — you remain the author. Nothing was sent.",
          ].join("\n"),
          modelId: "fake-model",
        };
      }
      return {
        text: `[fake:${request.role}] ${request.prompt.slice(0, 120)}`,
        modelId: "fake-model",
      };
    },
    async embed(request: AiEmbedRequest): Promise<AiEmbedResult> {
      const vectors = request.texts.map((text) => {
        const vector = Array.from({ length: dimensions }, (_, i) => {
          const code = text.charCodeAt(i % Math.max(text.length, 1)) || 0;
          return (code % 97) / 97;
        });
        return vector;
      });
      return { vectors, dimensions };
    },
  };
}

export function createAiProviderRegistry(initial: readonly AiProvider[] = []): AiProviderRegistry {
  const map = new Map<string, AiProvider>();
  let activeId: string | undefined;

  for (const provider of initial) {
    map.set(provider.id, provider);
    activeId ??= provider.id;
  }

  return {
    getActive() {
      return activeId ? map.get(activeId) : undefined;
    },
    get(id) {
      return map.get(id);
    },
    list() {
      return [...map.values()];
    },
    register(provider) {
      map.set(provider.id, provider);
      activeId ??= provider.id;
    },
    setActive(id) {
      if (!map.has(id)) {
        throw new Error("That Agent provider is not registered. Pick another and try again.");
      }
      activeId = id;
    },
  };
}

/**
 * Test/demo assembler — same allowlist as Context Builder, generous budget.
 * Prefer `createContextAssembler` for production host wiring.
 */
export function createFakeContextAssembler(): ContextAssembler {
  // Lazy import avoided: keep fake self-contained for PE05-S01 tests.
  const partsFor = (input: ContextAssemblerInput): string[] => {
    const parts = [`role=${input.role}`];
    if (input.profileExcerpt) {
      parts.push(`profile=${input.profileExcerpt}`);
    }
    if (input.resumeExcerpts?.length) {
      parts.push(`resume=${input.resumeExcerpts.join(" | ")}`);
    }
    if (input.projectsExcerpt) {
      parts.push(`projects=${input.projectsExcerpt}`);
    }
    if (input.achievementsExcerpt) {
      parts.push(`achievements=${input.achievementsExcerpt}`);
    }
    if (input.currentJobExcerpt) {
      parts.push(`currentJob=${input.currentJobExcerpt}`);
    }
    if (input.roleDescription) {
      parts.push(`listing=${input.roleDescription}`);
    }
    if (input.tonePreferences) {
      parts.push(`tone=${input.tonePreferences}`);
    }
    if (input.draftExcerpt) {
      parts.push(`draft=${input.draftExcerpt}`);
    }
    if (input.priorSendMeta) {
      parts.push(`prior=${input.priorSendMeta}`);
    }
    return parts;
  };

  return {
    assemble(input: ContextAssemblerInput): string {
      return partsFor(input).join("\n");
    },
  };
}
