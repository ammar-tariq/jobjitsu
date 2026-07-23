import type {
  AiCompleteRequest,
  AiCompleteResult,
  AiEmbedRequest,
  AiEmbedResult,
  AiHealth,
  AiProvider,
} from "./provider.js";

export type PathGatedAiProviderOptions = {
  readonly inner: AiProvider;
  /** Resolves the configured on-device model path (prefs). */
  readonly getLocalModelPath: () => Promise<string | undefined>;
  /**
   * Optional existence check — host may inject FS.
   * When omitted, any non-empty path is treated as configured (stub).
   */
  readonly pathExists?: (path: string) => Promise<boolean>;
};

const MISCONFIG_MESSAGE =
  "Choose a local model path in Preferences. Nothing leaves this device until Agent is ready.";

/**
 * Gates an AiProvider on a configured local model path.
 * health() never loads model weights — lazy until complete().
 */
export function createPathGatedAiProvider(options: PathGatedAiProviderOptions): AiProvider {
  const { inner, getLocalModelPath, pathExists } = options;

  async function resolvePathHealth(): Promise<AiHealth | null> {
    const path = (await getLocalModelPath())?.trim();
    if (!path) {
      return {
        status: "misconfigured",
        locality: "local",
        providerId: inner.id,
        message: MISCONFIG_MESSAGE,
      };
    }
    if (pathExists) {
      const exists = await pathExists(path);
      if (!exists) {
        return {
          status: "misconfigured",
          locality: "local",
          providerId: inner.id,
          message:
            "That model path could not be found. Confirm the path in Preferences and try again.",
        };
      }
    }
    return null;
  }

  return {
    id: inner.id,
    locality: "local",
    async health(): Promise<AiHealth> {
      const gated = await resolvePathHealth();
      if (gated) {
        return gated;
      }
      return inner.health();
    },
    async complete(request: AiCompleteRequest): Promise<AiCompleteResult> {
      const gated = await resolvePathHealth();
      if (gated) {
        throw new Error(gated.message ?? MISCONFIG_MESSAGE);
      }
      return inner.complete(request);
    },
    embed: inner.embed
      ? async (request: AiEmbedRequest): Promise<AiEmbedResult> => {
          const gated = await resolvePathHealth();
          if (gated) {
            throw new Error(gated.message ?? MISCONFIG_MESSAGE);
          }
          return inner.embed!(request);
        }
      : undefined,
  };
}
