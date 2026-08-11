/**
 * Local Intelligence provider contracts.
 * Primary path is local; remote only when user-configured and honestly labeled.
 */

export type AiProviderLocality = "local" | "remote";

export type AiHealthStatus = "ready" | "loading" | "unavailable" | "misconfigured";

export interface AiHealth {
  readonly status: AiHealthStatus;
  readonly locality: AiProviderLocality;
  readonly providerId: string;
  readonly message?: string;
}

export interface AiCompleteRequest {
  readonly role: AiPromptRole;
  readonly prompt: string;
  /** Optional structured schema hint — implementations may ignore. */
  readonly responseFormat?: "text" | "json";
  readonly abortSignal?: AbortSignal;
}

export type AiPromptRole =
  "tailor" | "match_explain" | "follow_up_draft" | "parse_assist" | "generic";

export interface AiCompleteResult {
  readonly text: string;
  readonly modelId?: string;
}

export interface AiEmbedRequest {
  readonly texts: readonly string[];
  readonly abortSignal?: AbortSignal;
}

export interface AiEmbedResult {
  readonly vectors: readonly (readonly number[])[];
  readonly dimensions: number;
}

/**
 * Swappable model runtime — no network assumed.
 * Must not phone home unless user selected a remote endpoint knowingly.
 */
export interface AiProvider {
  readonly id: string;
  readonly locality: AiProviderLocality;
  health(): Promise<AiHealth>;
  complete(request: AiCompleteRequest): Promise<AiCompleteResult>;
  embed?(request: AiEmbedRequest): Promise<AiEmbedResult>;
}

export interface AiProviderRegistry {
  getActive(): AiProvider | undefined;
  get(id: string): AiProvider | undefined;
  list(): readonly AiProvider[];
  /** Register a provider — host owns lifecycle. */
  register(provider: AiProvider): void;
  /**
   * Explicitly choose the active provider.
   * Never auto-promotes a remote provider over local.
   */
  setActive(id: string): void;
}

/**
 * Builds minimal local context — field allowlists enforced by implementations.
 * Must not dump full Timeline into every prompt.
 *
 * Slice order (apply-craft): Profile → Resume → Projects → Achievements →
 * Current Job → listing/tone/draft → Knowledge → prior send meta.
 */
export interface ContextAssemblerInput {
  readonly role: AiPromptRole;
  readonly profileExcerpt?: string;
  readonly resumeExcerpts?: readonly string[];
  readonly projectsExcerpt?: string;
  readonly achievementsExcerpt?: string;
  readonly currentJobExcerpt?: string;
  readonly roleDescription?: string;
  readonly tonePreferences?: string;
  readonly draftExcerpt?: string;
  readonly priorSendMeta?: string;
}

/** Knowledge Base read port — identity implements in PE14; Core may no-op. */
export interface KnowledgeReader {
  read(request: {
    readonly role: AiPromptRole;
    readonly budgetChars: number;
  }): readonly { readonly text: string }[];
}

export interface ContextAssembler {
  assemble(input: ContextAssemblerInput): string;
}
