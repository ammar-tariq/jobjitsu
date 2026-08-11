import type { AiCompleteRequest, AiCompleteResult, AiHealth, AiProvider } from "./provider.js";

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";

export type OllamaAiProviderOptions = {
  readonly id?: string;
  /** Loopback Ollama base URL — never a remote SaaS by default. */
  readonly baseUrl?: string;
  /**
   * Resolves the Ollama model name from Preferences (reuses `ai.localModelPath`).
   * Examples: `qwen2.5:3b`, `llama3.2:3b`, `phi3:mini`.
   */
  readonly getModelId: () => Promise<string | undefined>;
  /** Injectable fetch for tests — defaults to global fetch. */
  readonly fetch?: typeof fetch;
};

type OllamaTagsResponse = {
  readonly models?: readonly { readonly name?: string }[];
};

type OllamaGenerateResponse = {
  readonly response?: string;
  readonly model?: string;
  readonly error?: string;
};

function isLoopbackBaseUrl(baseUrl: string): boolean {
  try {
    const url = new URL(baseUrl);
    return url.hostname === "127.0.0.1" || url.hostname === "localhost" || url.hostname === "::1";
  } catch {
    return false;
  }
}

function modelIsInstalled(configured: string, installedNames: readonly string[]): boolean {
  if (installedNames.includes(configured)) {
    return true;
  }
  // Ollama may list `qwen2.5:3b-instruct` when user saved `qwen2.5:3b`
  if (
    installedNames.some(
      (name) => name.startsWith(`${configured}-`) || name.startsWith(`${configured}:`),
    )
  ) {
    return true;
  }
  // User saved bare `qwen2.5` and Ollama lists `qwen2.5:3b`
  if (!configured.includes(":")) {
    return installedNames.some((name) => name === configured || name.startsWith(`${configured}:`));
  }
  return false;
}

/**
 * On-device Agent via local Ollama (PE05-S06).
 * Talks only to a loopback endpoint; no cloud fallback.
 */
export function createOllamaAiProvider(options: OllamaAiProviderOptions): AiProvider {
  const id = options.id ?? "ollama-local";
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);

  if (!isLoopbackBaseUrl(baseUrl)) {
    throw new Error(
      "Ollama Agent only accepts a loopback URL (127.0.0.1 / localhost). Remote endpoints are opt-in elsewhere.",
    );
  }

  async function resolveModelId(): Promise<string | undefined> {
    return (await options.getModelId())?.trim() || undefined;
  }

  async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        body.trim() || `Ollama returned ${response.status}. Is Ollama running on this device?`,
      );
    }
    return (await response.json()) as T;
  }

  return {
    id,
    locality: "local",
    async health(): Promise<AiHealth> {
      const modelId = await resolveModelId();
      if (!modelId) {
        return {
          status: "misconfigured",
          locality: "local",
          providerId: id,
          message:
            "Choose a local Ollama model name in Preferences (for example qwen2.5:3b). Nothing leaves this device until Agent is ready.",
        };
      }

      try {
        const tags = await requestJson<OllamaTagsResponse>("/api/tags");
        const names = (tags.models ?? [])
          .map((model) => model.name?.trim())
          .filter((name): name is string => Boolean(name));

        if (names.length === 0) {
          return {
            status: "misconfigured",
            locality: "local",
            providerId: id,
            message:
              "Ollama is running but no models are installed. Pull a free model (see docs/guides/LOCAL_AGENT_MODELS.md).",
          };
        }

        if (!modelIsInstalled(modelId, names)) {
          return {
            status: "misconfigured",
            locality: "local",
            providerId: id,
            message: `Model “${modelId}” was not found in Ollama. Pull it locally, then save the name in Preferences.`,
          };
        }

        return {
          status: "ready",
          locality: "local",
          providerId: id,
          message: "Agent ready on this device (Ollama).",
        };
      } catch {
        return {
          status: "unavailable",
          locality: "local",
          providerId: id,
          message:
            "Ollama is not reachable on this device. Start Ollama, then confirm the model name in Preferences.",
        };
      }
    },
    async complete(request: AiCompleteRequest): Promise<AiCompleteResult> {
      const modelId = await resolveModelId();
      if (!modelId) {
        throw new Error(
          "Choose a local Ollama model name in Preferences. Nothing leaves this device until Agent is ready.",
        );
      }

      const system =
        request.role === "tailor"
          ? "You help tailor résumé drafts on the user's device. Stay factual to the provided résumé. User remains the author. Do not invent employers or dates."
          : request.role === "parse_assist"
            ? "Extract only facts clearly present in the text. Prefer empty fields over guessing."
            : request.role === "follow_up_draft"
              ? "Draft a calm follow-up the user can edit. Do not send anything."
              : "Help with on-device career craft. Be precise and calm. User remains the author.";

      try {
        const payload = await requestJson<OllamaGenerateResponse>("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: modelId,
            prompt: request.prompt,
            system,
            stream: false,
            format: request.responseFormat === "json" ? "json" : undefined,
          }),
          signal: request.abortSignal,
        });

        if (payload.error) {
          throw new Error(payload.error);
        }
        const text = payload.response?.trim() ?? "";
        if (!text) {
          throw new Error("Ollama returned an empty draft. Try again or pick another local model.");
        }
        return {
          text,
          modelId: payload.model ?? modelId,
        };
      } catch (cause) {
        if (cause instanceof Error) {
          throw cause;
        }
        throw new Error(
          "Could not reach Ollama on this device. Start Ollama and confirm the model name in Preferences.",
        );
      }
    },
  };
}
