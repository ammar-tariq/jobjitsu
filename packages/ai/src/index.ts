/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/ai" as const;

export type * from "./provider.js";

export {
  createAiProviderRegistry,
  createFakeAiProvider,
  createFakeContextAssembler,
  type FakeAiProviderOptions,
} from "./fake-provider.js";
export {
  CONTEXT_INPUT_ALLOWLIST,
  CONTEXT_SLICE_ORDER,
  createContextAssembler,
  createNoopKnowledgeReader,
  type ContextAssemblerOptions,
  type ContextSliceKey,
} from "./context-assembler.js";
export {
  createPathGatedAiProvider,
  type PathGatedAiProviderOptions,
} from "./path-gated-provider.js";
export {
  buildCraftUserPrompt,
  COVER_LETTER_SYSTEM_PROMPT,
  systemPromptForRole,
  TAILOR_SYSTEM_PROMPT,
  type CraftUserPromptInput,
} from "./craft-prompts.js";
export {
  createOllamaAiProvider,
  listOllamaModels,
  type ListOllamaModelsOptions,
  type ListOllamaModelsResult,
  type OllamaAiProviderOptions,
} from "./ollama-provider.js";
