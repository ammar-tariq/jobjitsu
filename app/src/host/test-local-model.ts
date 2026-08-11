import type { PreferencesFacade } from "@jobjitsu/preferences";

/** Stub path for tests — existence is not checked unless pathExists is injected. */
export const STUB_LOCAL_MODEL_PATH = "/models/jobjitsu-stub.gguf";

/** Configure a local model path so path-gated Agent health can become ready. */
export async function configureStubLocalModel(preferences: PreferencesFacade): Promise<void> {
  await preferences.setLocalModelPath(STUB_LOCAL_MODEL_PATH);
}
