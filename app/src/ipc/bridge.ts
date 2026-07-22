import type { Result } from "@jobjitsu/shared";
import type {
  AiStatusSnapshot,
  CraftPreferencesPatchInput,
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
  readonly getSelectedResume: () => Promise<Result<IpcResultMap["identity.getSelectedResume"]>>;
  readonly selectResume: (
    resumeId: string,
  ) => Promise<Result<IpcResultMap["identity.selectResume"]>>;
  readonly getDataRoot: () => Promise<Result<IpcResultMap["storage.getDataRoot"]>>;
  readonly setDataRoot: (path: string) => Promise<Result<IpcResultMap["storage.setDataRoot"]>>;
  readonly resetDataRoot: () => Promise<Result<IpcResultMap["storage.resetDataRoot"]>>;
  readonly pickDataRoot: () => Promise<Result<IpcResultMap["storage.pickDataRoot"]>>;
  readonly getApprovalBeforeSend: () => Promise<
    Result<IpcResultMap["preferences.getApprovalBeforeSend"]>
  >;
  readonly setApprovalBeforeSend: (
    requireApprovalBeforeSend: boolean,
  ) => Promise<Result<IpcResultMap["preferences.setApprovalBeforeSend"]>>;
  readonly getCraftPreferences: () => Promise<
    Result<IpcResultMap["preferences.getCraftPreferences"]>
  >;
  readonly setCraftPreferences: (
    patch: CraftPreferencesPatchInput,
  ) => Promise<Result<IpcResultMap["preferences.setCraftPreferences"]>>;
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
    async getSelectedResume() {
      return (await dispatcher.invoke("identity.getSelectedResume")) as Result<
        IpcResultMap["identity.getSelectedResume"]
      >;
    },
    async selectResume(resumeId: string) {
      return (await dispatcher.invoke("identity.selectResume", { resumeId })) as Result<
        IpcResultMap["identity.selectResume"]
      >;
    },
    async getDataRoot() {
      return (await dispatcher.invoke("storage.getDataRoot")) as Result<
        IpcResultMap["storage.getDataRoot"]
      >;
    },
    async setDataRoot(path: string) {
      return (await dispatcher.invoke("storage.setDataRoot", { path })) as Result<
        IpcResultMap["storage.setDataRoot"]
      >;
    },
    async resetDataRoot() {
      return (await dispatcher.invoke("storage.resetDataRoot")) as Result<
        IpcResultMap["storage.resetDataRoot"]
      >;
    },
    async pickDataRoot() {
      return (await dispatcher.invoke("storage.pickDataRoot")) as Result<
        IpcResultMap["storage.pickDataRoot"]
      >;
    },
    async getApprovalBeforeSend() {
      return (await dispatcher.invoke("preferences.getApprovalBeforeSend")) as Result<
        IpcResultMap["preferences.getApprovalBeforeSend"]
      >;
    },
    async setApprovalBeforeSend(requireApprovalBeforeSend: boolean) {
      return (await dispatcher.invoke("preferences.setApprovalBeforeSend", {
        requireApprovalBeforeSend,
      })) as Result<IpcResultMap["preferences.setApprovalBeforeSend"]>;
    },
    async getCraftPreferences() {
      return (await dispatcher.invoke("preferences.getCraftPreferences")) as Result<
        IpcResultMap["preferences.getCraftPreferences"]
      >;
    },
    async setCraftPreferences(patch: CraftPreferencesPatchInput) {
      return (await dispatcher.invoke("preferences.setCraftPreferences", patch)) as Result<
        IpcResultMap["preferences.setCraftPreferences"]
      >;
    },
  };
}
