import type { Result } from "@jobjitsu/shared";
import type { AiStatusSnapshot, IpcResultMap, ThemePreference } from "./commands.js";
import type { IpcDispatcher } from "./dispatcher.js";

export type IpcBridge = {
  readonly ping: () => Promise<Result<IpcResultMap["ping"]>>;
  readonly getTheme: () => Promise<Result<IpcResultMap["theme.get"]>>;
  readonly setTheme: (theme: ThemePreference) => Promise<Result<IpcResultMap["theme.set"]>>;
  readonly getAiStatus: () => Promise<Result<AiStatusSnapshot>>;
};

/**
 * Typed UI→host client. Only allowlisted methods exist — no `complete` / `embed`.
 */
export function createIpcBridge(dispatcher: IpcDispatcher): IpcBridge {
  return {
    async ping() {
      return (await dispatcher.invoke("ping")) as Result<IpcResultMap["ping"]>;
    },
    async getTheme() {
      return (await dispatcher.invoke("theme.get")) as Result<IpcResultMap["theme.get"]>;
    },
    async setTheme(theme: ThemePreference) {
      return (await dispatcher.invoke("theme.set", { theme })) as Result<IpcResultMap["theme.set"]>;
    },
    async getAiStatus() {
      return (await dispatcher.invoke("ai.getStatus")) as Result<AiStatusSnapshot>;
    },
  };
}
