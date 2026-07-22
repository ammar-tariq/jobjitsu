import { ok } from "@jobjitsu/shared";
import type { AiStatusSnapshot, ThemePreference } from "./commands.js";
import { createIpcDispatcher, type IpcDispatcher, type IpcHandlerMap } from "./dispatcher.js";

export type CreateHostIpcOptions = {
  readonly initialTheme?: ThemePreference;
  readonly aiStatus?: AiStatusSnapshot;
};

/**
 * Default W0 handlers: ping + theme / ai.getStatus stubs (no AI complete).
 */
export function createHostIpcHandlers(options: CreateHostIpcOptions = {}): IpcHandlerMap {
  let theme: ThemePreference = options.initialTheme ?? "dark";
  const aiStatus: AiStatusSnapshot = options.aiStatus ?? {
    ready: false,
    locality: "unavailable",
  };

  return {
    ping: () => ok({ ok: true as const, service: "jobjitsu-host" as const }),
    "theme.get": () => ok({ theme }),
    "theme.set": (payload) => {
      theme = payload.theme;
      return ok({ theme });
    },
    "ai.getStatus": () => ok(aiStatus),
  };
}

export function createHostIpcDispatcher(options: CreateHostIpcOptions = {}): IpcDispatcher {
  return createIpcDispatcher(createHostIpcHandlers(options));
}
