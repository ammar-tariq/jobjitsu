import { createAppError, err, ok } from "@jobjitsu/shared";
import type { ProfileRepository } from "@jobjitsu/identity";
import { createMemoryAppearanceStore, type AppearanceStore } from "../host/appearance-store.js";
import type { AiStatusSnapshot, ThemePreference } from "./commands.js";
import { createIpcDispatcher, type IpcDispatcher, type IpcHandlerMap } from "./dispatcher.js";

export type CreateHostIpcOptions = {
  readonly appearance?: AppearanceStore;
  readonly initialTheme?: ThemePreference;
  readonly aiStatus?: AiStatusSnapshot;
  readonly profiles?: ProfileRepository;
};

/**
 * Host IPC handlers — allowlisted only; no AI complete.
 */
export function createHostIpcHandlers(options: CreateHostIpcOptions = {}): IpcHandlerMap {
  const appearance =
    options.appearance ?? createMemoryAppearanceStore(options.initialTheme ?? "dark");
  const aiStatus: AiStatusSnapshot = options.aiStatus ?? {
    ready: false,
    locality: "unavailable",
  };
  const profiles = options.profiles;

  return {
    ping: () => ok({ ok: true as const, service: "jobjitsu-host" as const }),
    "theme.get": async () => ok({ theme: await appearance.getTheme() }),
    "theme.set": async (payload) => {
      const theme = await appearance.setTheme(payload.theme);
      return ok({ theme });
    },
    "ai.getStatus": () => ok(aiStatus),
    "identity.getProfile": async () => {
      if (!profiles) {
        return ok({ profile: null });
      }
      const profile = await profiles.get();
      return ok({ profile: profile ?? null });
    },
    "identity.setProfile": async (payload) => {
      if (!profiles) {
        return err(
          createAppError("unavailable", "Profile not ready", {
            message: "Identity storage is not available yet.",
            detail: "identity:missing",
          }),
        );
      }
      try {
        const profile = await profiles.upsert(payload);
        return ok({ profile });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not save profile", {
            message: cause instanceof Error ? cause.message : "Check your name and try again.",
            detail: "identity:upsert",
            cause,
          }),
        );
      }
    },
  };
}

export function createHostIpcDispatcher(options: CreateHostIpcOptions = {}): IpcDispatcher {
  return createIpcDispatcher(createHostIpcHandlers(options));
}
