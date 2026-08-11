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
  "preferences.getApprovalBeforeSend",
  "preferences.setApprovalBeforeSend",
  "preferences.getCraftPreferences",
  "preferences.setCraftPreferences",
  "preferences.getLocalModelPath",
  "preferences.setLocalModelPath",
  "applications.list",
  "applications.createDraft",
  "applications.updateDraft",
  "applications.tailorDraft",
  "craft.generate",
  "craft.exportResume",
] as const;

export type IpcCommandName = (typeof IPC_ALLOWLIST)[number];

export type ThemePreference = "dark" | "light";

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
  readonly stage?: string;
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

export type ApplicationDuplicateWarningSnapshot = {
  readonly matchedApplicationId: string;
  readonly message: string;
};

export type IpcPayloadMap = {
  readonly ping: undefined;
  readonly "theme.get": undefined;
  readonly "theme.set": { readonly theme: ThemePreference };
  readonly "ai.getStatus": undefined;
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
  readonly "preferences.getApprovalBeforeSend": undefined;
  readonly "preferences.setApprovalBeforeSend": { readonly requireApprovalBeforeSend: boolean };
  readonly "preferences.getCraftPreferences": undefined;
  readonly "preferences.setCraftPreferences": CraftPreferencesPatchInput;
  readonly "preferences.getLocalModelPath": undefined;
  readonly "preferences.setLocalModelPath": { readonly path: string };
  readonly "applications.list": undefined;
  readonly "applications.createDraft": ApplicationDraftCreateInput;
  readonly "applications.updateDraft": ApplicationDraftUpdateInput;
  readonly "applications.tailorDraft": ApplicationTailorDraftInput;
  readonly "craft.generate": CraftGenerateInput;
  readonly "craft.exportResume": CraftExportResumeInput;
};

export type IpcResultMap = {
  readonly ping: { readonly ok: true; readonly service: "jobjitsu-host" };
  readonly "theme.get": { readonly theme: ThemePreference };
  readonly "theme.set": { readonly theme: ThemePreference };
  readonly "ai.getStatus": AiStatusSnapshot;
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
  readonly "preferences.getApprovalBeforeSend": { readonly requireApprovalBeforeSend: boolean };
  readonly "preferences.setApprovalBeforeSend": { readonly requireApprovalBeforeSend: boolean };
  readonly "preferences.getCraftPreferences": { readonly craft: CraftPreferencesSnapshot };
  readonly "preferences.setCraftPreferences": { readonly craft: CraftPreferencesSnapshot };
  readonly "preferences.getLocalModelPath": { readonly path: string | null };
  readonly "preferences.setLocalModelPath": { readonly path: string | null };
  readonly "applications.list": { readonly applications: readonly ApplicationSnapshot[] };
  readonly "applications.createDraft": {
    readonly application: ApplicationSnapshot;
    readonly duplicateWarning?: ApplicationDuplicateWarningSnapshot;
  };
  readonly "applications.updateDraft": {
    readonly application: ApplicationSnapshot;
    readonly duplicateWarning?: ApplicationDuplicateWarningSnapshot;
  };
  readonly "applications.tailorDraft": ApplicationTailorDraftResult;
  readonly "craft.generate": CraftGenerateResult;
  readonly "craft.exportResume": CraftExportResumeResult;
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
