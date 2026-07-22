/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/ai" as const;

export type * from "./provider.js";

export {
  createAiProviderRegistry,
  createFakeAiProvider,
  createFakeContextAssembler,
  type FakeAiProviderOptions,
} from "./fake-provider.js";
