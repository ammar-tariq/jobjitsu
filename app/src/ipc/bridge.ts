import type { Result } from "@jobjitsu/shared";
import type {
  AiStatusSnapshot,
  ApplicationCoverLetterDraftInput,
  LocalModelsListResult,
  ApplicationDraftCreateInput,
  ApplicationDraftUpdateInput,
  ApplicationTailorDraftInput,
  CraftChatRefineInput,
  CraftExportResumeInput,
  CraftGenerateInput,
  CraftGenerateKind,
  CraftPreferencesPatchInput,
  CraftSessionPatchInput,
  IpcResultMap,
  IpcPayloadMap,
  PathPatchInput,
  ProfilePatchInput,
  ResumeAttachInputPayload,
  ResumeImportInputPayload,
  ResumeParseImportInputPayload,
  ThemePreference,
} from "./commands.js";
import type { IpcDispatcher } from "./dispatcher.js";

export type IpcBridge = {
  readonly ping: () => Promise<Result<IpcResultMap["ping"]>>;
  readonly getTheme: () => Promise<Result<IpcResultMap["theme.get"]>>;
  readonly setTheme: (theme: ThemePreference) => Promise<Result<IpcResultMap["theme.set"]>>;
  readonly getAiStatus: () => Promise<Result<AiStatusSnapshot>>;
  readonly listLocalModels: () => Promise<Result<LocalModelsListResult>>;
  readonly getProfile: () => Promise<Result<IpcResultMap["identity.getProfile"]>>;
  readonly setProfile: (
    patch: ProfilePatchInput,
  ) => Promise<Result<IpcResultMap["identity.setProfile"]>>;
  readonly listProfiles: () => Promise<Result<IpcResultMap["identity.listProfiles"]>>;
  readonly selectProfile: (
    profileId: string,
  ) => Promise<Result<IpcResultMap["identity.selectProfile"]>>;
  readonly listResumeVersions: () => Promise<Result<IpcResultMap["identity.listResumeVersions"]>>;
  readonly importResume: (
    input: ResumeImportInputPayload,
  ) => Promise<Result<IpcResultMap["identity.importResume"]>>;
  readonly parseImportDraft: (
    input: ResumeParseImportInputPayload,
  ) => Promise<Result<IpcResultMap["identity.parseImportDraft"]>>;
  readonly getSelectedResume: () => Promise<Result<IpcResultMap["identity.getSelectedResume"]>>;
  readonly selectResume: (
    resumeId: string,
  ) => Promise<Result<IpcResultMap["identity.selectResume"]>>;
  readonly attachResume: (
    input: ResumeAttachInputPayload,
  ) => Promise<Result<IpcResultMap["identity.attachResume"]>>;
  readonly listPaths: () => Promise<Result<IpcResultMap["identity.listPaths"]>>;
  readonly upsertPath: (
    patch: PathPatchInput,
  ) => Promise<Result<IpcResultMap["identity.upsertPath"]>>;
  readonly archivePath: (pathId: string) => Promise<Result<IpcResultMap["identity.archivePath"]>>;
  readonly selectPath: (pathId: string) => Promise<Result<IpcResultMap["identity.selectPath"]>>;
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
  readonly getOnboardingCompleted: () => Promise<
    Result<IpcResultMap["preferences.getOnboardingCompleted"]>
  >;
  readonly setOnboardingCompleted: (
    completed: boolean,
  ) => Promise<Result<IpcResultMap["preferences.setOnboardingCompleted"]>>;
  readonly getCraftPreferences: () => Promise<
    Result<IpcResultMap["preferences.getCraftPreferences"]>
  >;
  readonly setCraftPreferences: (
    patch: CraftPreferencesPatchInput,
  ) => Promise<Result<IpcResultMap["preferences.setCraftPreferences"]>>;
  readonly getLocalModelPath: () => Promise<Result<IpcResultMap["preferences.getLocalModelPath"]>>;
  readonly setLocalModelPath: (
    path: string,
  ) => Promise<Result<IpcResultMap["preferences.setLocalModelPath"]>>;
  readonly listApplications: () => Promise<Result<IpcResultMap["applications.list"]>>;
  readonly createApplicationDraft: (
    input: ApplicationDraftCreateInput,
  ) => Promise<Result<IpcResultMap["applications.createDraft"]>>;
  readonly updateApplicationDraft: (
    input: ApplicationDraftUpdateInput,
  ) => Promise<Result<IpcResultMap["applications.updateDraft"]>>;
  readonly deleteApplicationDraft: (
    id: string,
  ) => Promise<Result<IpcResultMap["applications.deleteDraft"]>>;
  readonly tailorApplicationDraft: (
    input: ApplicationTailorDraftInput,
  ) => Promise<Result<IpcResultMap["applications.tailorDraft"]>>;
  readonly generateApplicationCoverLetter: (
    input: ApplicationCoverLetterDraftInput,
  ) => Promise<Result<IpcResultMap["applications.generateCoverLetter"]>>;
  readonly mergeApplications: (
    targetId: string,
    sourceId: string,
  ) => Promise<Result<IpcResultMap["applications.merge"]>>;
  readonly archiveApplication: (
    id: string,
  ) => Promise<Result<IpcResultMap["applications.archive"]>>;
  readonly overrideApplication: (
    input: IpcPayloadMap["applications.override"],
  ) => Promise<Result<IpcResultMap["applications.override"]>>;
  readonly listMailboxIntegrations: () => Promise<Result<IpcResultMap["mailbox.listIntegrations"]>>;
  readonly connectSampleMailbox: () => Promise<Result<IpcResultMap["mailbox.connectSample"]>>;
  readonly beginMailboxConnect: (
    provider: "gmail" | "outlook",
  ) => Promise<Result<IpcResultMap["mailbox.beginConnect"]>>;
  readonly syncMailbox: (id: string) => Promise<Result<IpcResultMap["mailbox.sync"]>>;
  readonly getMailboxIntegration: (
    id: string,
  ) => Promise<Result<IpcResultMap["mailbox.getIntegration"]>>;
  readonly disconnectMailbox: (id: string) => Promise<Result<IpcResultMap["mailbox.disconnect"]>>;
  readonly deleteMailboxData: (id: string) => Promise<Result<IpcResultMap["mailbox.deleteData"]>>;
  readonly getMailboxDashboard: () => Promise<Result<IpcResultMap["mailbox.getDashboard"]>>;
  readonly listMailboxActions: () => Promise<Result<IpcResultMap["mailbox.listActions"]>>;
  readonly completeMailboxAction: (
    id: string,
  ) => Promise<Result<IpcResultMap["mailbox.completeAction"]>>;
  readonly listApplicationTimeline: (
    applicationId: string,
  ) => Promise<Result<IpcResultMap["mailbox.listTimeline"]>>;
  readonly listApplicationEmails: (
    applicationId: string,
  ) => Promise<Result<IpcResultMap["mailbox.listLinkedEmails"]>>;
  readonly getMailboxEmail: (id: string) => Promise<Result<IpcResultMap["mailbox.getEmail"]>>;
  readonly confirmMailboxMatch: (
    emailId: string,
    applicationId: string,
  ) => Promise<Result<IpcResultMap["mailbox.confirmMatch"]>>;
  readonly keepMailboxSeparate: (
    emailId: string,
  ) => Promise<Result<IpcResultMap["mailbox.keepSeparate"]>>;
  readonly dismissDuplicateApplications: (
    leftId: string,
    rightId: string,
  ) => Promise<Result<IpcResultMap["mailbox.dismissDuplicate"]>>;
  readonly getMailboxSettings: () => Promise<Result<IpcResultMap["mailbox.getSettings"]>>;
  readonly updateMailboxSettings: (
    patch: IpcPayloadMap["mailbox.updateSettings"],
  ) => Promise<Result<IpcResultMap["mailbox.updateSettings"]>>;
  readonly generateCraftDrafts: (
    input: CraftGenerateInput,
  ) => Promise<Result<IpcResultMap["craft.generate"]>>;
  readonly exportCraftResume: (
    input: CraftExportResumeInput,
  ) => Promise<Result<IpcResultMap["craft.exportResume"]>>;
  readonly refineCraftChat: (
    input: CraftChatRefineInput,
  ) => Promise<Result<IpcResultMap["craft.chatRefine"]>>;
  readonly getCraftSession: () => Promise<Result<IpcResultMap["craft.getSession"]>>;
  readonly patchCraftSession: (
    patch: CraftSessionPatchInput,
  ) => Promise<Result<IpcResultMap["craft.patchSession"]>>;
  readonly prepareCraftDrafts: (
    kind: CraftGenerateKind,
  ) => Promise<Result<IpcResultMap["craft.prepareDrafts"]>>;
  readonly getResources: () => Promise<Result<IpcResultMap["system.getResources"]>>;
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
    async listLocalModels() {
      return (await dispatcher.invoke("ai.listLocalModels")) as Result<LocalModelsListResult>;
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
    async listProfiles() {
      return (await dispatcher.invoke("identity.listProfiles")) as Result<
        IpcResultMap["identity.listProfiles"]
      >;
    },
    async selectProfile(profileId: string) {
      return (await dispatcher.invoke("identity.selectProfile", { profileId })) as Result<
        IpcResultMap["identity.selectProfile"]
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
    async parseImportDraft(input: ResumeParseImportInputPayload) {
      return (await dispatcher.invoke("identity.parseImportDraft", input)) as Result<
        IpcResultMap["identity.parseImportDraft"]
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
    async attachResume(input: ResumeAttachInputPayload) {
      return (await dispatcher.invoke("identity.attachResume", input)) as Result<
        IpcResultMap["identity.attachResume"]
      >;
    },
    async listPaths() {
      return (await dispatcher.invoke("identity.listPaths")) as Result<
        IpcResultMap["identity.listPaths"]
      >;
    },
    async upsertPath(patch: PathPatchInput) {
      return (await dispatcher.invoke("identity.upsertPath", patch)) as Result<
        IpcResultMap["identity.upsertPath"]
      >;
    },
    async archivePath(pathId: string) {
      return (await dispatcher.invoke("identity.archivePath", { pathId })) as Result<
        IpcResultMap["identity.archivePath"]
      >;
    },
    async selectPath(pathId: string) {
      return (await dispatcher.invoke("identity.selectPath", { pathId })) as Result<
        IpcResultMap["identity.selectPath"]
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
    async getOnboardingCompleted() {
      return (await dispatcher.invoke("preferences.getOnboardingCompleted")) as Result<
        IpcResultMap["preferences.getOnboardingCompleted"]
      >;
    },
    async setOnboardingCompleted(completed: boolean) {
      return (await dispatcher.invoke("preferences.setOnboardingCompleted", {
        completed,
      })) as Result<IpcResultMap["preferences.setOnboardingCompleted"]>;
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
    async getLocalModelPath() {
      return (await dispatcher.invoke("preferences.getLocalModelPath")) as Result<
        IpcResultMap["preferences.getLocalModelPath"]
      >;
    },
    async setLocalModelPath(path: string) {
      return (await dispatcher.invoke("preferences.setLocalModelPath", { path })) as Result<
        IpcResultMap["preferences.setLocalModelPath"]
      >;
    },
    async listApplications() {
      return (await dispatcher.invoke("applications.list")) as Result<
        IpcResultMap["applications.list"]
      >;
    },
    async createApplicationDraft(input: ApplicationDraftCreateInput) {
      return (await dispatcher.invoke("applications.createDraft", input)) as Result<
        IpcResultMap["applications.createDraft"]
      >;
    },
    async updateApplicationDraft(input: ApplicationDraftUpdateInput) {
      return (await dispatcher.invoke("applications.updateDraft", input)) as Result<
        IpcResultMap["applications.updateDraft"]
      >;
    },
    async deleteApplicationDraft(id: string) {
      return (await dispatcher.invoke("applications.deleteDraft", { id })) as Result<
        IpcResultMap["applications.deleteDraft"]
      >;
    },
    async tailorApplicationDraft(input: ApplicationTailorDraftInput) {
      return (await dispatcher.invoke("applications.tailorDraft", input)) as Result<
        IpcResultMap["applications.tailorDraft"]
      >;
    },
    async generateApplicationCoverLetter(input: ApplicationCoverLetterDraftInput) {
      return (await dispatcher.invoke("applications.generateCoverLetter", input)) as Result<
        IpcResultMap["applications.generateCoverLetter"]
      >;
    },
    async mergeApplications(targetId: string, sourceId: string) {
      return (await dispatcher.invoke("applications.merge", { targetId, sourceId })) as Result<
        IpcResultMap["applications.merge"]
      >;
    },
    async archiveApplication(id: string) {
      return (await dispatcher.invoke("applications.archive", { id })) as Result<
        IpcResultMap["applications.archive"]
      >;
    },
    async overrideApplication(input: IpcPayloadMap["applications.override"]) {
      return (await dispatcher.invoke("applications.override", input)) as Result<
        IpcResultMap["applications.override"]
      >;
    },
    async listMailboxIntegrations() {
      return (await dispatcher.invoke("mailbox.listIntegrations")) as Result<
        IpcResultMap["mailbox.listIntegrations"]
      >;
    },
    async connectSampleMailbox() {
      return (await dispatcher.invoke("mailbox.connectSample")) as Result<
        IpcResultMap["mailbox.connectSample"]
      >;
    },
    async beginMailboxConnect(provider: "gmail" | "outlook") {
      return (await dispatcher.invoke("mailbox.beginConnect", { provider })) as Result<
        IpcResultMap["mailbox.beginConnect"]
      >;
    },
    async syncMailbox(id: string) {
      return (await dispatcher.invoke("mailbox.sync", { id })) as Result<
        IpcResultMap["mailbox.sync"]
      >;
    },
    async getMailboxIntegration(id: string) {
      return (await dispatcher.invoke("mailbox.getIntegration", { id })) as Result<
        IpcResultMap["mailbox.getIntegration"]
      >;
    },
    async disconnectMailbox(id: string) {
      return (await dispatcher.invoke("mailbox.disconnect", { id })) as Result<
        IpcResultMap["mailbox.disconnect"]
      >;
    },
    async deleteMailboxData(id: string) {
      return (await dispatcher.invoke("mailbox.deleteData", { id })) as Result<
        IpcResultMap["mailbox.deleteData"]
      >;
    },
    async getMailboxDashboard() {
      return (await dispatcher.invoke("mailbox.getDashboard")) as Result<
        IpcResultMap["mailbox.getDashboard"]
      >;
    },
    async listMailboxActions() {
      return (await dispatcher.invoke("mailbox.listActions")) as Result<
        IpcResultMap["mailbox.listActions"]
      >;
    },
    async completeMailboxAction(id: string) {
      return (await dispatcher.invoke("mailbox.completeAction", { id })) as Result<
        IpcResultMap["mailbox.completeAction"]
      >;
    },
    async listApplicationTimeline(applicationId: string) {
      return (await dispatcher.invoke("mailbox.listTimeline", { applicationId })) as Result<
        IpcResultMap["mailbox.listTimeline"]
      >;
    },
    async listApplicationEmails(applicationId: string) {
      return (await dispatcher.invoke("mailbox.listLinkedEmails", { applicationId })) as Result<
        IpcResultMap["mailbox.listLinkedEmails"]
      >;
    },
    async getMailboxEmail(id: string) {
      return (await dispatcher.invoke("mailbox.getEmail", { id })) as Result<
        IpcResultMap["mailbox.getEmail"]
      >;
    },
    async confirmMailboxMatch(emailId: string, applicationId: string) {
      return (await dispatcher.invoke("mailbox.confirmMatch", {
        emailId,
        applicationId,
      })) as Result<IpcResultMap["mailbox.confirmMatch"]>;
    },
    async keepMailboxSeparate(emailId: string) {
      return (await dispatcher.invoke("mailbox.keepSeparate", { emailId })) as Result<
        IpcResultMap["mailbox.keepSeparate"]
      >;
    },
    async dismissDuplicateApplications(leftId: string, rightId: string) {
      return (await dispatcher.invoke("mailbox.dismissDuplicate", { leftId, rightId })) as Result<
        IpcResultMap["mailbox.dismissDuplicate"]
      >;
    },
    async getMailboxSettings() {
      return (await dispatcher.invoke("mailbox.getSettings")) as Result<
        IpcResultMap["mailbox.getSettings"]
      >;
    },
    async updateMailboxSettings(patch: IpcPayloadMap["mailbox.updateSettings"]) {
      return (await dispatcher.invoke("mailbox.updateSettings", patch)) as Result<
        IpcResultMap["mailbox.updateSettings"]
      >;
    },
    async generateCraftDrafts(input: CraftGenerateInput) {
      return (await dispatcher.invoke("craft.generate", input)) as Result<
        IpcResultMap["craft.generate"]
      >;
    },
    async exportCraftResume(input: CraftExportResumeInput) {
      return (await dispatcher.invoke("craft.exportResume", input)) as Result<
        IpcResultMap["craft.exportResume"]
      >;
    },
    async refineCraftChat(input: CraftChatRefineInput) {
      return (await dispatcher.invoke("craft.chatRefine", input)) as Result<
        IpcResultMap["craft.chatRefine"]
      >;
    },
    async getCraftSession() {
      return (await dispatcher.invoke("craft.getSession")) as Result<
        IpcResultMap["craft.getSession"]
      >;
    },
    async patchCraftSession(patch: CraftSessionPatchInput) {
      return (await dispatcher.invoke("craft.patchSession", patch)) as Result<
        IpcResultMap["craft.patchSession"]
      >;
    },
    async prepareCraftDrafts(kind: CraftGenerateKind) {
      return (await dispatcher.invoke("craft.prepareDrafts", { kind })) as Result<
        IpcResultMap["craft.prepareDrafts"]
      >;
    },
    async getResources() {
      return (await dispatcher.invoke("system.getResources")) as Result<
        IpcResultMap["system.getResources"]
      >;
    },
  };
}
