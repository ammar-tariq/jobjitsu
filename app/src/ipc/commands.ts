import { createAppError, err, ok, type Result } from "@jobjitsu/shared";

/**
 * Deny-by-default host↔UI command allowlist (ADR 0013).
 * Career egress / AI complete are intentionally absent.
 */
export const IPC_ALLOWLIST = [
  "ping",
  "theme.get",
  "theme.set",
  "ai.getStatus",
  "ai.listLocalModels",
  "identity.getProfile",
  "identity.setProfile",
  "identity.listProfiles",
  "identity.selectProfile",
  "identity.listResumeVersions",
  "identity.importResume",
  "identity.parseImportDraft",
  "identity.getSelectedResume",
  "identity.selectResume",
  "identity.attachResume",
  "identity.listPaths",
  "identity.upsertPath",
  "identity.archivePath",
  "identity.selectPath",
  "storage.getDataRoot",
  "storage.setDataRoot",
  "storage.resetDataRoot",
  "storage.pickDataRoot",
  "storage.resetSelected",
  "storage.backupSelected",
  "storage.restoreBackup",
  "preferences.getApprovalBeforeSend",
  "preferences.setApprovalBeforeSend",
  "preferences.getOnboardingCompleted",
  "preferences.setOnboardingCompleted",
  "preferences.getCraftPreferences",
  "preferences.setCraftPreferences",
  "preferences.getLocalModelPath",
  "preferences.setLocalModelPath",
  "resources.get",
  "applications.list",
  "applications.createDraft",
  "applications.updateDraft",
  "applications.deleteDraft",
  "applications.tailorDraft",
  "applications.generateCoverLetter",
  "applications.merge",
  "applications.archive",
  "applications.override",
  "mailbox.listIntegrations",
  "mailbox.connectSample",
  "mailbox.beginConnect",
  "mailbox.connectProvider",
  "mailbox.sync",
  "mailbox.getIntegration",
  "mailbox.disconnect",
  "mailbox.deleteData",
  "mailbox.getDashboard",
  "mailbox.listActions",
  "mailbox.completeAction",
  "mailbox.listTimeline",
  "mailbox.listLinkedEmails",
  "mailbox.getEmail",
  "mailbox.confirmMatch",
  "mailbox.keepSeparate",
  "mailbox.dismissDuplicate",
  "mailbox.getSettings",
  "mailbox.updateSettings",
  "craft.generate",
  "craft.exportResume",
  "craft.chatRefine",
  "craft.getSession",
  "craft.patchSession",
  "craft.prepareDrafts",
  "system.getResources",
] as const;

export type IpcCommandName = (typeof IPC_ALLOWLIST)[number];

export type ThemePreference = "dark" | "light";

export type LocalModelsListStatus = "ready" | "empty" | "unavailable";

export type LocalModelsListResult = {
  readonly models: readonly string[];
  readonly listStatus: LocalModelsListStatus;
  readonly message?: string;
};

export type AiStatusSnapshot = {
  readonly ready: boolean;
  /**
   * User-facing locality chrome.
   * `local` may show Agent · On-device; `remote` must not; `unavailable` is calm default.
   */
  readonly locality: "local" | "remote" | "unavailable";
};

export type ProfileSnapshot = {
  readonly id: string;
  readonly displayName: string;
  readonly email?: string;
  readonly location?: string;
  readonly updatedAt: string;
};

export type ProfilePatchInput = {
  readonly id?: string;
  readonly displayName: string;
  readonly email?: string;
  readonly location?: string;
  /** Always create a new local identity. */
  readonly createNew?: boolean;
};

export type ResumeVersionSnapshot = {
  readonly id: string;
  readonly profileId: string;
  readonly label: string;
  readonly createdAt: string;
  readonly format: "document" | "structured";
  readonly blobId?: string;
  readonly fileName?: string;
  readonly contentType?: string;
  readonly byteLength?: number;
  readonly parentVersionId?: string;
  readonly pathId?: string;
  readonly contactName?: string;
  readonly contactEmail?: string;
  readonly notes?: string;
  readonly source?: "resume" | "linkedin-pdf";
};

export type ResumeImportInputPayload = {
  readonly label: string;
  readonly fileName: string;
  /** Original file bytes as base64 — stays on-device via host identity APIs. */
  readonly contentBase64: string;
  readonly contentType?: string;
  readonly parentVersionId?: string;
  readonly pathId?: string;
  readonly contactName?: string;
  readonly contactEmail?: string;
  readonly notes?: string;
  readonly source?: "resume" | "linkedin-pdf";
};

/** Draft-only parse request — does not import, attach, or send. */
export type ResumeParseImportInputPayload = {
  readonly contentBase64: string;
  readonly fileName?: string;
  readonly contentType?: string;
};

export type ResumeParseImportResult = {
  readonly contactName: string;
  readonly contactEmail: string;
  readonly notes: string;
  readonly parseStatus: "prefilled" | "unavailable" | "manual";
};

export type ResumeAttachInputPayload = {
  readonly resumeId: string;
  /** Patch allowlisted identity fields from the version's review data. */
  readonly updateIdentity?: boolean;
  /** When set, set this path's selected résumé to the version. */
  readonly pathId?: string;
};

export type PathSnapshot = {
  readonly id: string;
  readonly profileId: string;
  readonly name: string;
  readonly notes?: string;
  readonly archived: boolean;
  readonly updatedAt: string;
  readonly selectedResumeVersionId?: string;
};

export type PathPatchInput = {
  readonly id?: string;
  readonly name: string;
  readonly notes?: string;
  readonly profileId?: string;
  readonly selectedResumeVersionId?: string | null;
};

export type DataRootSnapshot = {
  readonly path: string;
  readonly defaultPath: string;
  readonly isCustom: boolean;
};

/** PE21 Reset — which on-device slices to clear / backup. Never includes `.env`. */
export type DataResetSelectionSnapshot = {
  readonly profiles: boolean;
  readonly jobMail: boolean;
  readonly applications: boolean;
  readonly craft: boolean;
  readonly timeline: boolean;
  readonly agentModelPath: boolean;
};

export type CraftPreferencesSnapshot = {
  readonly fitKeywords: readonly string[];
  readonly tone: string;
  readonly constraints: readonly string[];
};

export type CraftPreferencesPatchInput = {
  readonly fitKeywords?: readonly string[];
  readonly tone?: string;
  readonly constraints?: readonly string[];
};

export type ResourceSnapshotResult = {
  readonly available: boolean;
  readonly cpuPercent: number | null;
  readonly memoryUsedBytes: number | null;
  readonly memoryTotalBytes: number | null;
  readonly memoryPercent: number | null;
  readonly message?: string;
};

export type ApplicationSnapshot = {
  readonly id: string;
  readonly stage: string;
  readonly trackingStatus: string;
  readonly companyName: string;
  readonly roleTitle: string;
  readonly sourceUrl?: string;
  readonly requisitionId?: string;
  readonly roleId?: string;
  readonly resumeVersionId?: string;
  readonly notes?: string;
  readonly resumeDraftText?: string;
  readonly coverLetterDraftText?: string;
  readonly followUpAt?: string;
  readonly followUpDraftText?: string;
  readonly followUpId?: string;
  readonly source?: string;
  readonly lifecycleStatus?: string;
  readonly lifecycleLabel?: string;
  readonly companyDomain?: string;
  readonly appliedAt?: string;
  readonly lastActivityAt?: string;
  readonly nextAction?: string;
  readonly nextActionDueAt?: string;
  readonly recruiterName?: string;
  readonly recruiterEmail?: string;
  readonly confidence?: number;
  readonly archived?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ApplicationDraftCreateInput = {
  readonly companyName: string;
  readonly roleTitle: string;
  readonly sourceUrl?: string;
  readonly requisitionId?: string;
  readonly roleId?: string;
  readonly resumeVersionId?: string;
  readonly notes?: string;
  readonly resumeDraftText?: string;
  readonly coverLetterDraftText?: string;
};

export type ApplicationDraftUpdateInput = {
  readonly id: string;
  readonly companyName?: string;
  readonly roleTitle?: string;
  readonly sourceUrl?: string | null;
  readonly requisitionId?: string | null;
  readonly roleId?: string | null;
  readonly resumeVersionId?: string | null;
  readonly notes?: string | null;
  readonly resumeDraftText?: string | null;
  readonly coverLetterDraftText?: string | null;
  readonly followUpAt?: string | null;
  readonly followUpDraftText?: string | null;
  readonly stage?: string;
  readonly lifecycleStatus?: string | null;
  readonly archived?: boolean;
};

export type ApplicationTailorDraftInput = {
  readonly applicationId: string;
  readonly resumeExcerpts?: readonly string[];
  readonly tonePreferences?: string;
};

export type ApplicationTailorDraftResult = {
  readonly application: ApplicationSnapshot | null;
  readonly draftText: string;
  readonly tailorStatus: "ready" | "unavailable" | "failed";
};

export type ApplicationCoverLetterDraftInput = {
  readonly applicationId: string;
  readonly resumeExcerpts?: readonly string[];
  readonly tonePreferences?: string;
};

export type ApplicationCoverLetterDraftResult = {
  readonly application: ApplicationSnapshot | null;
  readonly draftText: string;
  readonly coverLetterStatus: "ready" | "unavailable" | "failed";
};

export type CraftGenerateKind = "resume" | "cover_letter" | "both";

export type CraftGenerateInput = {
  readonly kind: CraftGenerateKind;
  readonly resumeText: string;
  readonly jobDescription: string;
  readonly aboutCompany?: string;
};

export type CraftGenerateResult = {
  readonly resumeDraft: string;
  readonly coverLetterDraft: string;
  readonly craftStatus: "ready" | "unavailable" | "failed" | "invalid";
  readonly message?: string;
};

export type CraftExportFormat = "html" | "pdf";

export type CraftExportResumeInput = {
  readonly draftText: string;
  readonly format: CraftExportFormat;
  /** When true, host opens a save dialog and writes on this device. */
  readonly save?: boolean;
};

export type CraftExportResumeResult = {
  readonly html: string;
  readonly pdfBase64: string;
  readonly fileName: string;
  readonly savedPath: string | null;
  readonly exportStatus: "ready" | "saved" | "cancelled" | "invalid" | "failed" | "unavailable";
  readonly message?: string;
};

export type CraftChatTarget = "resume" | "cover_letter";

export type CraftChatMessageSnapshot = {
  readonly role: "user" | "assistant";
  readonly content: string;
};

export type CraftChatRefineInput = {
  readonly message: string;
  readonly target: CraftChatTarget;
  readonly resumeText: string;
  readonly jobDescription: string;
  readonly aboutCompany?: string;
  readonly resumeDraft: string;
  readonly coverLetterDraft: string;
  readonly history?: readonly CraftChatMessageSnapshot[];
};

export type CraftChatRefineResult = {
  readonly chatStatus: "reply" | "clarify" | "unavailable" | "failed" | "invalid";
  readonly assistantMessage: string;
  readonly clarifyingQuestions: readonly string[];
  readonly resumeDraft: string;
  readonly coverLetterDraft: string;
};

export type CraftJobPhase = "checking" | "resume" | "cover_letter" | null;

export type CraftJobStatus = "idle" | "running" | "ready" | "failed" | "unavailable" | "invalid";

export type CraftJobSnapshot = {
  readonly status: CraftJobStatus;
  readonly phase: CraftJobPhase;
  readonly kind: CraftGenerateKind | null;
  readonly message: string | null;
  readonly startedAt: string | null;
};

export type CraftSessionSnapshot = {
  readonly resumeText: string;
  readonly jobDescription: string;
  readonly aboutCompany: string;
  readonly resumeDraft: string;
  readonly coverLetterDraft: string;
  readonly saveCompany: string;
  readonly saveRole: string;
  readonly chatTarget: CraftChatTarget;
  readonly chatInput: string;
  readonly chatMessages: readonly CraftChatMessageSnapshot[];
  readonly job: CraftJobSnapshot;
};

export type CraftSessionPatchInput = {
  readonly resumeText?: string;
  readonly jobDescription?: string;
  readonly aboutCompany?: string;
  readonly resumeDraft?: string;
  readonly coverLetterDraft?: string;
  readonly saveCompany?: string;
  readonly saveRole?: string;
  readonly chatTarget?: CraftChatTarget;
  readonly chatInput?: string;
  readonly chatMessages?: readonly CraftChatMessageSnapshot[];
};

export type ApplicationDuplicateWarningSnapshot = {
  readonly matchedApplicationId: string;
  readonly message: string;
};

export type MailboxIntegrationSnapshot = {
  readonly id: string;
  readonly provider: string;
  readonly label: string;
  readonly emailAddress?: string;
  readonly connected: boolean;
  readonly lastSyncedAt?: string;
  readonly syncStatus: string;
  readonly syncError?: string;
  readonly emailsProcessed: number;
  readonly emailsIngested?: number;
  readonly emailsTotal?: number;
  readonly jobRelatedCount: number;
  readonly applicationsFound: number;
};

export type MailboxActionSnapshot = {
  readonly id: string;
  readonly applicationId?: string;
  readonly emailId?: string;
  readonly actionType: string;
  readonly priority: string;
  readonly description: string;
  readonly dueAt?: string;
  readonly completed: boolean;
};

export type MailboxTimelineSnapshot = {
  readonly id: string;
  readonly type: string;
  readonly at: string;
  readonly summary: string;
  readonly emailId?: string;
  readonly flagged: boolean;
};

export type MailboxEmailSnapshot = {
  readonly id: string;
  readonly subject: string;
  readonly senderEmail: string;
  readonly senderName?: string;
  readonly snippet: string;
  readonly bodyText?: string;
  readonly receivedAt?: string;
  readonly sentAt?: string;
  readonly direction: string;
  readonly classification?: string;
  readonly matchUncertain?: boolean;
};

export type MailboxDashboardSnapshot = {
  readonly summary: {
    readonly totalApplications: number;
    readonly activeApplications: number;
    readonly interviews: number;
    readonly assessments: number;
    readonly offers: number;
    readonly rejected: number;
    readonly awaitingResponse: number;
    readonly actionsRequired: number;
  };
  readonly funnel: {
    readonly applied: number;
    readonly responses: number;
    readonly interviews: number;
    readonly offers: number;
  };
  readonly actions: readonly MailboxActionSnapshot[];
  readonly duplicates: readonly {
    readonly leftId: string;
    readonly rightId: string;
    readonly companyName: string;
    readonly leftRole: string;
    readonly rightRole: string;
  }[];
  readonly analytics: {
    readonly windowDays: number;
    readonly applications: number;
    readonly responses: number;
    readonly responseRate: number;
    readonly interviews: number;
    readonly interviewRate: number;
    readonly offers: number;
    readonly offerRate: number;
  };
  readonly integrations: readonly MailboxIntegrationSnapshot[];
};

export type MailboxSettingsSnapshot = {
  readonly lookbackDays: number;
  readonly noResponseAfterDays: number;
  readonly notifyAssessments: boolean;
  readonly notifyInterviews: boolean;
  readonly notifyRejections: boolean;
  readonly notifyOffers: boolean;
};

export type IpcPayloadMap = {
  readonly ping: undefined;
  readonly "theme.get": undefined;
  readonly "theme.set": { readonly theme: ThemePreference };
  readonly "ai.getStatus": undefined;
  readonly "ai.listLocalModels": undefined;
  readonly "identity.getProfile": undefined;
  readonly "identity.setProfile": ProfilePatchInput;
  readonly "identity.listProfiles": undefined;
  readonly "identity.selectProfile": { readonly profileId: string };
  readonly "identity.listResumeVersions": undefined;
  readonly "identity.importResume": ResumeImportInputPayload;
  readonly "identity.parseImportDraft": ResumeParseImportInputPayload;
  readonly "identity.getSelectedResume": undefined;
  readonly "identity.selectResume": { readonly resumeId: string };
  readonly "identity.attachResume": ResumeAttachInputPayload;
  readonly "identity.listPaths": undefined;
  readonly "identity.upsertPath": PathPatchInput;
  readonly "identity.archivePath": { readonly pathId: string };
  readonly "identity.selectPath": { readonly pathId: string };
  readonly "storage.getDataRoot": undefined;
  readonly "storage.setDataRoot": { readonly path: string };
  readonly "storage.resetDataRoot": undefined;
  readonly "storage.pickDataRoot": undefined;
  readonly "storage.resetSelected": DataResetSelectionSnapshot;
  readonly "storage.backupSelected": DataResetSelectionSnapshot;
  readonly "storage.restoreBackup": undefined;
  readonly "preferences.getApprovalBeforeSend": undefined;
  readonly "preferences.setApprovalBeforeSend": { readonly requireApprovalBeforeSend: boolean };
  readonly "preferences.getOnboardingCompleted": undefined;
  readonly "preferences.setOnboardingCompleted": { readonly completed: boolean };
  readonly "preferences.getCraftPreferences": undefined;
  readonly "preferences.setCraftPreferences": CraftPreferencesPatchInput;
  readonly "preferences.getLocalModelPath": undefined;
  readonly "preferences.setLocalModelPath": { readonly path: string };
  readonly "resources.get": undefined;
  readonly "applications.list": undefined;
  readonly "applications.createDraft": ApplicationDraftCreateInput;
  readonly "applications.updateDraft": ApplicationDraftUpdateInput;
  readonly "applications.deleteDraft": { readonly id: string };
  readonly "applications.tailorDraft": ApplicationTailorDraftInput;
  readonly "applications.generateCoverLetter": ApplicationCoverLetterDraftInput;
  readonly "applications.merge": { readonly targetId: string; readonly sourceId: string };
  readonly "applications.archive": { readonly id: string };
  readonly "applications.override": {
    readonly id: string;
    readonly companyName?: string;
    readonly roleTitle?: string;
    readonly lifecycleStatus?: string;
    readonly appliedAt?: string;
    readonly recruiterName?: string;
    readonly recruiterEmail?: string;
  };
  readonly "mailbox.listIntegrations": undefined;
  readonly "mailbox.connectSample": undefined;
  readonly "mailbox.beginConnect": { readonly provider: "gmail" | "outlook" };
  readonly "mailbox.connectProvider": {
    readonly provider: "gmail" | "outlook";
    readonly accessToken: string;
    readonly refreshToken?: string;
    readonly emailAddress?: string;
  };
  readonly "mailbox.sync": { readonly id: string };
  readonly "mailbox.getIntegration": { readonly id: string };
  readonly "mailbox.disconnect": { readonly id: string };
  readonly "mailbox.deleteData": { readonly id: string };
  readonly "mailbox.getDashboard": undefined;
  readonly "mailbox.listActions": undefined;
  readonly "mailbox.completeAction": { readonly id: string };
  readonly "mailbox.listTimeline": { readonly applicationId: string };
  readonly "mailbox.listLinkedEmails": { readonly applicationId: string };
  readonly "mailbox.getEmail": { readonly id: string };
  readonly "mailbox.confirmMatch": { readonly emailId: string; readonly applicationId: string };
  readonly "mailbox.keepSeparate": { readonly emailId: string };
  readonly "mailbox.dismissDuplicate": { readonly leftId: string; readonly rightId: string };
  readonly "mailbox.getSettings": undefined;
  readonly "mailbox.updateSettings": Partial<MailboxSettingsSnapshot>;
  readonly "craft.generate": CraftGenerateInput;
  readonly "craft.exportResume": CraftExportResumeInput;
  readonly "craft.chatRefine": CraftChatRefineInput;
  readonly "craft.getSession": undefined;
  readonly "craft.patchSession": CraftSessionPatchInput;
  readonly "craft.prepareDrafts": { readonly kind: CraftGenerateKind };
  readonly "system.getResources": undefined;
};

export type IpcResultMap = {
  readonly ping: { readonly ok: true; readonly service: "jobjitsu-host" };
  readonly "theme.get": { readonly theme: ThemePreference };
  readonly "theme.set": { readonly theme: ThemePreference };
  readonly "ai.getStatus": AiStatusSnapshot;
  readonly "ai.listLocalModels": LocalModelsListResult;
  readonly "identity.getProfile": { readonly profile: ProfileSnapshot | null };
  readonly "identity.setProfile": { readonly profile: ProfileSnapshot };
  readonly "identity.listProfiles": {
    readonly profiles: readonly ProfileSnapshot[];
    readonly selectedId: string | null;
  };
  readonly "identity.selectProfile": { readonly profile: ProfileSnapshot };
  readonly "identity.listResumeVersions": {
    readonly versions: readonly ResumeVersionSnapshot[];
    readonly selectedId: string | null;
  };
  readonly "identity.importResume": { readonly version: ResumeVersionSnapshot };
  readonly "identity.parseImportDraft": ResumeParseImportResult;
  readonly "identity.getSelectedResume": { readonly version: ResumeVersionSnapshot | null };
  readonly "identity.selectResume": { readonly version: ResumeVersionSnapshot };
  readonly "identity.attachResume": {
    readonly version: ResumeVersionSnapshot;
    readonly profile: ProfileSnapshot | null;
    readonly path: PathSnapshot | null;
  };
  readonly "identity.listPaths": {
    readonly paths: readonly PathSnapshot[];
    readonly selectedId: string | null;
  };
  readonly "identity.upsertPath": { readonly path: PathSnapshot };
  readonly "identity.archivePath": { readonly path: PathSnapshot };
  readonly "identity.selectPath": { readonly path: PathSnapshot };
  readonly "storage.getDataRoot": { readonly dataRoot: DataRootSnapshot };
  readonly "storage.setDataRoot": { readonly dataRoot: DataRootSnapshot };
  readonly "storage.resetDataRoot": { readonly dataRoot: DataRootSnapshot };
  readonly "storage.pickDataRoot": {
    readonly dataRoot: DataRootSnapshot | null;
    readonly cancelled: boolean;
  };
  readonly "storage.resetSelected": { readonly cleared: readonly string[] };
  readonly "storage.backupSelected": { readonly backupPath: string | null };
  readonly "storage.restoreBackup": { readonly restored: readonly string[] };
  readonly "preferences.getApprovalBeforeSend": { readonly requireApprovalBeforeSend: boolean };
  readonly "preferences.setApprovalBeforeSend": { readonly requireApprovalBeforeSend: boolean };
  readonly "preferences.getOnboardingCompleted": { readonly completed: boolean };
  readonly "preferences.setOnboardingCompleted": { readonly completed: boolean };
  readonly "preferences.getCraftPreferences": { readonly craft: CraftPreferencesSnapshot };
  readonly "preferences.setCraftPreferences": { readonly craft: CraftPreferencesSnapshot };
  readonly "preferences.getLocalModelPath": { readonly path: string | null };
  readonly "preferences.setLocalModelPath": { readonly path: string | null };
  readonly "resources.get": { readonly resources: ResourceSnapshotResult };
  readonly "applications.list": { readonly applications: readonly ApplicationSnapshot[] };
  readonly "applications.createDraft": {
    readonly application: ApplicationSnapshot;
    readonly duplicateWarning?: ApplicationDuplicateWarningSnapshot;
  };
  readonly "applications.updateDraft": {
    readonly application: ApplicationSnapshot;
    readonly duplicateWarning?: ApplicationDuplicateWarningSnapshot;
  };
  readonly "applications.deleteDraft": { readonly deleted: boolean };
  readonly "applications.tailorDraft": ApplicationTailorDraftResult;
  readonly "applications.generateCoverLetter": ApplicationCoverLetterDraftResult;
  readonly "applications.merge": { readonly application: ApplicationSnapshot | null };
  readonly "applications.archive": { readonly application: ApplicationSnapshot | null };
  readonly "applications.override": { readonly application: ApplicationSnapshot | null };
  readonly "mailbox.listIntegrations": {
    readonly integrations: readonly MailboxIntegrationSnapshot[];
  };
  readonly "mailbox.connectSample": { readonly integration: MailboxIntegrationSnapshot };
  readonly "mailbox.beginConnect": { readonly status: string; readonly message: string };
  readonly "mailbox.connectProvider": { readonly integration: MailboxIntegrationSnapshot };
  readonly "mailbox.sync": { readonly integration: MailboxIntegrationSnapshot };
  readonly "mailbox.getIntegration": { readonly integration: MailboxIntegrationSnapshot | null };
  readonly "mailbox.disconnect": { readonly integration: MailboxIntegrationSnapshot | null };
  readonly "mailbox.deleteData": { readonly deleted: boolean };
  readonly "mailbox.getDashboard": { readonly dashboard: MailboxDashboardSnapshot };
  readonly "mailbox.listActions": { readonly actions: readonly MailboxActionSnapshot[] };
  readonly "mailbox.completeAction": { readonly action: MailboxActionSnapshot | null };
  readonly "mailbox.listTimeline": { readonly events: readonly MailboxTimelineSnapshot[] };
  readonly "mailbox.listLinkedEmails": { readonly emails: readonly MailboxEmailSnapshot[] };
  readonly "mailbox.getEmail": { readonly email: MailboxEmailSnapshot | null };
  readonly "mailbox.confirmMatch": { readonly email: MailboxEmailSnapshot | null };
  readonly "mailbox.keepSeparate": { readonly email: MailboxEmailSnapshot | null };
  readonly "mailbox.dismissDuplicate": { readonly dismissed: boolean };
  readonly "mailbox.getSettings": { readonly settings: MailboxSettingsSnapshot };
  readonly "mailbox.updateSettings": { readonly settings: MailboxSettingsSnapshot };
  readonly "craft.generate": CraftGenerateResult;
  readonly "craft.exportResume": CraftExportResumeResult;
  readonly "craft.chatRefine": CraftChatRefineResult;
  readonly "craft.getSession": { readonly session: CraftSessionSnapshot };
  readonly "craft.patchSession": { readonly session: CraftSessionSnapshot };
  readonly "craft.prepareDrafts": { readonly session: CraftSessionSnapshot };
  readonly "system.getResources": { readonly resources: ResourceSnapshotResult };
};

export function isIpcCommandName(value: string): value is IpcCommandName {
  return (IPC_ALLOWLIST as readonly string[]).includes(value);
}

export function deniedUnknownCommand(command: string): Result<never> {
  return err(
    createAppError("permission", "Command not allowed", {
      message: "That host command is not on the allowlist.",
      detail: `denied:${command}`,
    }),
  );
}

export function notImplementedCommand(command: IpcCommandName): Result<never> {
  return err(
    createAppError("unavailable", "Command not ready", {
      message: "This host command is reserved but not implemented yet.",
      detail: `stub:${command}`,
    }),
  );
}

/** Success helper for allowlisted handlers. */
export function ipcOk<T>(value: T): Result<T> {
  return ok(value);
}
