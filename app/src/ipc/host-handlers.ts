import { createAppError, err, ok } from "@jobjitsu/shared";
import type { ProfileRepository, ResumeLibrary } from "@jobjitsu/identity";
import type { EventBus } from "@jobjitsu/events";
import { createMemoryAppearanceStore, type AppearanceStore } from "../host/appearance-store.js";
import type { AiStatusSnapshot, ThemePreference } from "./commands.js";
import { createIpcDispatcher, type IpcDispatcher, type IpcHandlerMap } from "./dispatcher.js";

export type CreateHostIpcOptions = {
  readonly appearance?: AppearanceStore;
  readonly initialTheme?: ThemePreference;
  readonly aiStatus?: AiStatusSnapshot;
  readonly profiles?: ProfileRepository;
  readonly resumeLibrary?: ResumeLibrary;
  /** When set, successful imports emit Resume.Imported (id only). */
  readonly bus?: EventBus;
};

/**
 * Host IPC handlers — allowlisted only; no AI complete.
 */
export function createHostIpcHandlers(options: CreateHostIpcOptions = {}): IpcHandlerMap {
  const appearance =
    options.appearance ?? createMemoryAppearanceStore(options.initialTheme ?? "dark");
  const aiStatus: AiStatusSnapshot = options.aiStatus ?? {
    ready: false,
    locality: "unavailable",
  };
  const profiles = options.profiles;
  const resumeLibrary = options.resumeLibrary;
  const bus = options.bus;

  return {
    ping: () => ok({ ok: true as const, service: "jobjitsu-host" as const }),
    "theme.get": async () => ok({ theme: await appearance.getTheme() }),
    "theme.set": async (payload) => {
      const theme = await appearance.setTheme(payload.theme);
      return ok({ theme });
    },
    "ai.getStatus": () => ok(aiStatus),
    "identity.getProfile": async () => {
      if (!profiles) {
        return ok({ profile: null });
      }
      const profile = await profiles.get();
      return ok({ profile: profile ?? null });
    },
    "identity.setProfile": async (payload) => {
      if (!profiles) {
        return err(
          createAppError("unavailable", "Profile not ready", {
            message: "Identity storage is not available yet.",
            detail: "identity:missing",
          }),
        );
      }
      try {
        const profile = await profiles.upsert(payload);
        return ok({ profile });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not save profile", {
            message: cause instanceof Error ? cause.message : "Check your name and try again.",
            detail: "identity:upsert",
            cause,
          }),
        );
      }
    },
    "identity.listResumeVersions": async () => {
      if (!resumeLibrary) {
        return ok({ versions: [] });
      }
      const versions = await resumeLibrary.list();
      return ok({ versions });
    },
    "identity.importResume": async (payload) => {
      if (!resumeLibrary) {
        return err(
          createAppError("unavailable", "Resume library not ready", {
            message: "Resume storage is not available yet.",
            detail: "identity:resume-missing",
          }),
        );
      }
      try {
        const bytes = decodeBase64(payload.contentBase64);
        const version = await resumeLibrary.import({
          label: payload.label,
          fileName: payload.fileName,
          bytes,
          contentType: payload.contentType,
        });
        if (bus) {
          await bus.publish("Resume.Imported", { resumeId: version.id });
        }
        return ok({ version });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not import resume", {
            message:
              cause instanceof Error
                ? cause.message
                : "Something went wrong importing that file. Try again.",
            detail: "identity:import",
            cause,
          }),
        );
      }
    },
  };
}

export function createHostIpcDispatcher(options: CreateHostIpcOptions = {}): IpcDispatcher {
  return createIpcDispatcher(createHostIpcHandlers(options));
}

function decodeBase64(value: string): Uint8Array {
  const trimmed = value.trim();
  if (!trimmed) {
    return new Uint8Array();
  }
  try {
    const binary = atob(trimmed);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    throw new Error("That file could not be read. Try another resume.");
  }
}
