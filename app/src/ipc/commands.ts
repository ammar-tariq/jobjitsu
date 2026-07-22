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

export type IpcPayloadMap = {
  readonly ping: undefined;
  readonly "theme.get": undefined;
  readonly "theme.set": { readonly theme: ThemePreference };
  readonly "ai.getStatus": undefined;
  readonly "identity.getProfile": undefined;
  readonly "identity.setProfile": ProfilePatchInput;
};

export type IpcResultMap = {
  readonly ping: { readonly ok: true; readonly service: "jobjitsu-host" };
  readonly "theme.get": { readonly theme: ThemePreference };
  readonly "theme.set": { readonly theme: ThemePreference };
  readonly "ai.getStatus": AiStatusSnapshot;
  readonly "identity.getProfile": { readonly profile: ProfileSnapshot | null };
  readonly "identity.setProfile": { readonly profile: ProfileSnapshot };
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
