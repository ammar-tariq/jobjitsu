import type { Result } from "@jobjitsu/shared";
import type {
  AiStatusSnapshot,
  IpcResultMap,
  ProfilePatchInput,
  ResumeImportInputPayload,
  ThemePreference,
} from "./commands.js";
import type { IpcDispatcher } from "./dispatcher.js";

export type IpcBridge = {
  readonly ping: () => Promise<Result<IpcResultMap["ping"]>>;
  readonly getTheme: () => Promise<Result<IpcResultMap["theme.get"]>>;
  readonly setTheme: (theme: ThemePreference) => Promise<Result<IpcResultMap["theme.set"]>>;
  readonly getAiStatus: () => Promise<Result<AiStatusSnapshot>>;
  readonly getProfile: () => Promise<Result<IpcResultMap["identity.getProfile"]>>;
  readonly setProfile: (
    patch: ProfilePatchInput,
  ) => Promise<Result<IpcResultMap["identity.setProfile"]>>;
  readonly listResumeVersions: () => Promise<Result<IpcResultMap["identity.listResumeVersions"]>>;
  readonly importResume: (
    input: ResumeImportInputPayload,
  ) => Promise<Result<IpcResultMap["identity.importResume"]>>;
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
    async getProfile() {
      return (await dispatcher.invoke("identity.getProfile")) as Result<
        IpcResultMap["identity.getProfile"]
      >;
    },
    async setProfile(patch: ProfilePatchInput) {
      return (await dispatcher.invoke("identity.setProfile", patch)) as Result<
        IpcResultMap["identity.setProfile"]
      >;
    },
    async listResumeVersions() {
      return (await dispatcher.invoke("identity.listResumeVersions")) as Result<
        IpcResultMap["identity.listResumeVersions"]
      >;
    },
    async importResume(input: ResumeImportInputPayload) {
      return (await dispatcher.invoke("identity.importResume", input)) as Result<
        IpcResultMap["identity.importResume"]
      >;
    },
  };
}
