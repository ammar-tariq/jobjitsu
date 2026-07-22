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
  "identity.listResumeVersions",
  "identity.importResume",
  "identity.getSelectedResume",
  "identity.selectResume",
  "storage.getDataRoot",
  "storage.setDataRoot",
  "storage.resetDataRoot",
  "storage.pickDataRoot",
] as const;

export type IpcCommandName = (typeof IPC_ALLOWLIST)[number];

export type ThemePreference = "dark" | "light";

export type AiStatusSnapshot = {
  readonly ready: boolean;
  /** User-facing locality chrome — never implies remote as On-device. */
  readonly locality: "local" | "unavailable";
};

export type ProfileSnapshot = {
  readonly id: string;
  readonly displayName: string;
  readonly email?: string;
  readonly location?: string;
  readonly updatedAt: string;
};

export type ProfilePatchInput = {
  readonly displayName: string;
  readonly email?: string;
  readonly location?: string;
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
};

export type ResumeImportInputPayload = {
  readonly label: string;
  readonly fileName: string;
  /** Original file bytes as base64 — stays on-device via host identity APIs. */
  readonly contentBase64: string;
  readonly contentType?: string;
  readonly parentVersionId?: string;
};

export type DataRootSnapshot = {
  readonly path: string;
  readonly defaultPath: string;
  readonly isCustom: boolean;
};

export type IpcPayloadMap = {
  readonly ping: undefined;
  readonly "theme.get": undefined;
  readonly "theme.set": { readonly theme: ThemePreference };
  readonly "ai.getStatus": undefined;
  readonly "identity.getProfile": undefined;
  readonly "identity.setProfile": ProfilePatchInput;
  readonly "identity.listResumeVersions": undefined;
  readonly "identity.importResume": ResumeImportInputPayload;
  readonly "identity.getSelectedResume": undefined;
  readonly "identity.selectResume": { readonly resumeId: string };
  readonly "storage.getDataRoot": undefined;
  readonly "storage.setDataRoot": { readonly path: string };
  readonly "storage.resetDataRoot": undefined;
  readonly "storage.pickDataRoot": undefined;
};

export type IpcResultMap = {
  readonly ping: { readonly ok: true; readonly service: "jobjitsu-host" };
  readonly "theme.get": { readonly theme: ThemePreference };
  readonly "theme.set": { readonly theme: ThemePreference };
  readonly "ai.getStatus": AiStatusSnapshot;
  readonly "identity.getProfile": { readonly profile: ProfileSnapshot | null };
  readonly "identity.setProfile": { readonly profile: ProfileSnapshot };
  readonly "identity.listResumeVersions": {
    readonly versions: readonly ResumeVersionSnapshot[];
    readonly selectedId: string | null;
  };
  readonly "identity.importResume": { readonly version: ResumeVersionSnapshot };
  readonly "identity.getSelectedResume": { readonly version: ResumeVersionSnapshot | null };
  readonly "identity.selectResume": { readonly version: ResumeVersionSnapshot };
  readonly "storage.getDataRoot": { readonly dataRoot: DataRootSnapshot };
  readonly "storage.setDataRoot": { readonly dataRoot: DataRootSnapshot };
  readonly "storage.resetDataRoot": { readonly dataRoot: DataRootSnapshot };
  readonly "storage.pickDataRoot": {
    readonly dataRoot: DataRootSnapshot | null;
    readonly cancelled: boolean;
  };
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
