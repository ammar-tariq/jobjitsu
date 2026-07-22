import { ok } from "@jobjitsu/shared";
import { createMemoryAppearanceStore, type AppearanceStore } from "../host/appearance-store.js";
import type { AiStatusSnapshot, ThemePreference } from "./commands.js";
import { createIpcDispatcher, type IpcDispatcher, type IpcHandlerMap } from "./dispatcher.js";

export type CreateHostIpcOptions = {
  readonly appearance?: AppearanceStore;
  readonly initialTheme?: ThemePreference;
  readonly aiStatus?: AiStatusSnapshot;
};

/**
 * Default W0 handlers: ping + theme / ai.getStatus stubs (no AI complete).
 * Theme reads/writes go through the appearance store (survives shared restart).
 */
export function createHostIpcHandlers(options: CreateHostIpcOptions = {}): IpcHandlerMap {
  const appearance =
    options.appearance ?? createMemoryAppearanceStore(options.initialTheme ?? "dark");
  const aiStatus: AiStatusSnapshot = options.aiStatus ?? {
    ready: false,
    locality: "unavailable",
  };

  return {
    ping: () => ok({ ok: true as const, service: "jobjitsu-host" as const }),
    "theme.get": async () => ok({ theme: await appearance.getTheme() }),
    "theme.set": async (payload) => {
      const theme = await appearance.setTheme(payload.theme);
      return ok({ theme });
    },
    "ai.getStatus": () => ok(aiStatus),
  };
}

export function createHostIpcDispatcher(options: CreateHostIpcOptions = {}): IpcDispatcher {
  return createIpcDispatcher(createHostIpcHandlers(options));
}
