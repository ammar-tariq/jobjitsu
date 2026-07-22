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
  readonly embedDimensions?: number;
};

/**
 * In-process fake AI — no Ollama, no network, no model files.
 * Suitable for unit tests and Desktop Foundation demos.
 */
export function createFakeAiProvider(options: FakeAiProviderOptions = {}): AiProvider {
  const id = options.id ?? "fake-ai";
  const dimensions = options.embedDimensions ?? 8;

  return {
    id,
    locality: "local",
    async health(): Promise<AiHealth> {
      return {
        status: options.healthStatus ?? "ready",
        locality: "local",
        providerId: id,
        message: "Fake on-device provider (not a real model)",
      };
    },
    async complete(request: AiCompleteRequest): Promise<AiCompleteResult> {
      const text =
        typeof options.completeText === "function"
          ? options.completeText(request)
          : (options.completeText ?? `[fake:${request.role}] ${request.prompt.slice(0, 120)}`);
      return { text, modelId: "fake-model" };
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
  };
}

/** Minimal context assembler — concatenates allowlisted fields only. */
export function createFakeContextAssembler(): ContextAssembler {
  return {
    assemble(input: ContextAssemblerInput): string {
      const parts = [`role=${input.role}`];
      if (input.resumeExcerpts?.length) {
        parts.push(`resume=${input.resumeExcerpts.join(" | ")}`);
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
      return parts.join("\n");
    },
  };
}
