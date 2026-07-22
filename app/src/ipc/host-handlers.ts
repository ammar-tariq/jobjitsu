import { createAppError, err, ok } from "@jobjitsu/shared";
import type { ProfileRepository, ResumeLibrary } from "@jobjitsu/identity";
import type { PreferencesFacade } from "@jobjitsu/preferences";
import type { EventBus } from "@jobjitsu/events";
import { createMemoryAppearanceStore, type AppearanceStore } from "../host/appearance-store.js";
import { createMemoryDataRootStore, type DataRootStore } from "../host/data-root-store.js";
import { createHostFolderPicker, type FolderPicker } from "../host/folder-picker.js";
import type { AiStatusSnapshot, ThemePreference } from "./commands.js";
import { createIpcDispatcher, type IpcDispatcher, type IpcHandlerMap } from "./dispatcher.js";

export type CreateHostIpcOptions = {
  readonly appearance?: AppearanceStore;
  readonly initialTheme?: ThemePreference;
  readonly aiStatus?: AiStatusSnapshot;
  readonly profiles?: ProfileRepository;
  readonly resumeLibrary?: ResumeLibrary;
  readonly dataRoot?: DataRootStore;
  readonly preferences?: PreferencesFacade;
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
  const dataRoot = options.dataRoot ?? createMemoryDataRootStore();
  const preferences = options.preferences;
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
        return ok({ versions: [], selectedId: null });
      }
      const versions = await resumeLibrary.list();
      const selected = await resumeLibrary.getSelected();
      return ok({ versions, selectedId: selected?.id ?? null });
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
          parentVersionId: payload.parentVersionId,
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
    "identity.getSelectedResume": async () => {
      if (!resumeLibrary) {
        return ok({ version: null });
      }
      const version = await resumeLibrary.getSelected();
      return ok({ version: version ?? null });
    },
    "identity.selectResume": async (payload) => {
      if (!resumeLibrary) {
        return err(
          createAppError("unavailable", "Resume library not ready", {
            message: "Resume storage is not available yet.",
            detail: "identity:resume-missing",
          }),
        );
      }
      try {
        const version = await resumeLibrary.select(payload.resumeId);
        return ok({ version });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not select resume", {
            message:
              cause instanceof Error
                ? cause.message
                : "That resume version could not be selected. Try again.",
            detail: "identity:select",
            cause,
          }),
        );
      }
    },
    "storage.getDataRoot": async () => ok({ dataRoot: await dataRoot.get() }),
    "storage.setDataRoot": async (payload) => {
      try {
        const next = await dataRoot.set(payload.path);
        if (bus) {
          await bus.publish("Preferences.Changed", { keys: ["dataRoot"] });
        }
        return ok({ dataRoot: next });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not update data folder", {
            message:
              cause instanceof Error
                ? cause.message
                : "That folder path could not be saved. Try again.",
            detail: "storage:dataRoot",
            cause,
          }),
        );
      }
    },
    "storage.resetDataRoot": async () => {
      const next = await dataRoot.reset();
      if (bus) {
        await bus.publish("Preferences.Changed", { keys: ["dataRoot"] });
      }
      return ok({ dataRoot: next });
    },
    "preferences.getApprovalBeforeSend": async () => {
      if (!preferences) {
        return ok({ requireApprovalBeforeSend: true });
      }
      return ok({ requireApprovalBeforeSend: await preferences.getApprovalBeforeSend() });
    },
    "preferences.setApprovalBeforeSend": async (payload) => {
      if (!preferences) {
        return err(
          createAppError("unavailable", "Preferences not ready", {
            message: "Preferences storage is not available yet.",
            detail: "preferences:missing",
          }),
        );
      }
      try {
        const requireApprovalBeforeSend = await preferences.setApprovalBeforeSend(
          payload.requireApprovalBeforeSend,
        );
        if (bus) {
          await bus.publish("Preferences.Changed", { keys: ["requireApprovalBeforeSend"] });
        }
        return ok({ requireApprovalBeforeSend });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not update approval setting", {
            message:
              cause instanceof Error
                ? cause.message
                : "That preference could not be saved. Try again.",
            detail: "preferences:approval",
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
