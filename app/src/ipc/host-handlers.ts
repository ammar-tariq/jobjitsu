import { createAppError, err, ok } from "@jobjitsu/shared";
import type { PathLibrary, ProfileRepository, ResumeLibrary } from "@jobjitsu/identity";
import type { PreferencesFacade } from "@jobjitsu/preferences";
import type { EventBus } from "@jobjitsu/events";
import { createMemoryAppearanceStore, type AppearanceStore } from "../host/appearance-store.js";
import {
  createMemoryDataRootStore,
  type DataRootSnapshot,
  type DataRootStore,
} from "../host/data-root-store.js";
import { createHostFolderPicker, type FolderPicker } from "../host/folder-picker.js";
import type { AiStatusSnapshot, ThemePreference } from "./commands.js";
import { createIpcDispatcher, type IpcDispatcher, type IpcHandlerMap } from "./dispatcher.js";

export type CreateHostIpcOptions = {
  readonly appearance?: AppearanceStore;
  readonly getAppearance?: () => AppearanceStore;
  readonly initialTheme?: ThemePreference;
  readonly aiStatus?: AiStatusSnapshot;
  readonly getAiStatus?: () => AiStatusSnapshot;
  readonly profiles?: ProfileRepository;
  readonly getProfiles?: () => ProfileRepository | undefined;
  readonly resumeLibrary?: ResumeLibrary;
  readonly getResumeLibrary?: () => ResumeLibrary | undefined;
  readonly pathLibrary?: PathLibrary;
  readonly getPathLibrary?: () => PathLibrary | undefined;
  readonly dataRoot?: DataRootStore;
  readonly preferences?: PreferencesFacade;
  readonly getPreferences?: () => PreferencesFacade | undefined;
  readonly folderPicker?: FolderPicker;
  /**
   * After the data-folder preference changes — rebind durable stores under the new path.
   */
  readonly onDataRootChanged?: (snapshot: DataRootSnapshot) => Promise<void>;
  /** When set, successful imports emit Resume.Imported (id only). */
  readonly bus?: EventBus;
};

/**
 * Host IPC handlers — allowlisted only; no AI complete.
 */
export function createHostIpcHandlers(options: CreateHostIpcOptions = {}): IpcHandlerMap {
  const getAppearance =
    options.getAppearance ??
    (() => options.appearance ?? createMemoryAppearanceStore(options.initialTheme ?? "dark"));
  const getAiStatus =
    options.getAiStatus ??
    (() =>
      options.aiStatus ?? {
        ready: false,
        locality: "unavailable" as const,
      });
  const getProfiles = options.getProfiles ?? (() => options.profiles);
  const getResumeLibrary = options.getResumeLibrary ?? (() => options.resumeLibrary);
  const getPathLibrary = options.getPathLibrary ?? (() => options.pathLibrary);
  const dataRoot = options.dataRoot ?? createMemoryDataRootStore();
  const getPreferences = options.getPreferences ?? (() => options.preferences);
  const folderPicker = options.folderPicker ?? createHostFolderPicker();
  const bus = options.bus;
  const onDataRootChanged = options.onDataRootChanged;

  async function commitDataRoot(next: DataRootSnapshot) {
    if (onDataRootChanged) {
      await onDataRootChanged(next);
    }
    if (bus) {
      await bus.publish("Preferences.Changed", { keys: ["dataRoot"] });
    }
    return next;
  }

  return {
    ping: () => ok({ ok: true as const, service: "jobjitsu-host" as const }),
    "theme.get": async () => ok({ theme: await getAppearance().getTheme() }),
    "theme.set": async (payload) => {
      const theme = await getAppearance().setTheme(payload.theme);
      return ok({ theme });
    },
    "ai.getStatus": () => ok(getAiStatus()),
    "identity.getProfile": async () => {
      const profiles = getProfiles();
      if (!profiles) {
        return ok({ profile: null });
      }
      const profile = await profiles.get();
      return ok({ profile: profile ?? null });
    },
    "identity.setProfile": async (payload) => {
      const profiles = getProfiles();
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
      const resumeLibrary = getResumeLibrary();
      if (!resumeLibrary) {
        return ok({ versions: [], selectedId: null });
      }
      const versions = await resumeLibrary.list();
      const selected = await resumeLibrary.getSelected();
      return ok({ versions, selectedId: selected?.id ?? null });
    },
    "identity.importResume": async (payload) => {
      const resumeLibrary = getResumeLibrary();
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
          pathId: payload.pathId,
        });
        if (payload.pathId) {
          const pathLibrary = getPathLibrary();
          if (pathLibrary) {
            const path = await pathLibrary.get(payload.pathId);
            if (path) {
              await pathLibrary.upsert({
                id: path.id,
                name: path.name,
                notes: path.notes,
                selectedResumeVersionId: version.id,
              });
            }
          }
        }
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
      const resumeLibrary = getResumeLibrary();
      if (!resumeLibrary) {
        return ok({ version: null });
      }
      const version = await resumeLibrary.getSelected();
      return ok({ version: version ?? null });
    },
    "identity.selectResume": async (payload) => {
      const resumeLibrary = getResumeLibrary();
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
    "identity.listPaths": async () => {
      const pathLibrary = getPathLibrary();
      if (!pathLibrary) {
        return ok({ paths: [], selectedId: null });
      }
      const paths = await pathLibrary.list();
      const selected = await pathLibrary.getSelected();
      return ok({ paths, selectedId: selected?.id ?? null });
    },
    "identity.upsertPath": async (payload) => {
      const pathLibrary = getPathLibrary();
      if (!pathLibrary) {
        return err(
          createAppError("unavailable", "Paths not ready", {
            message: "Path storage is not available yet.",
            detail: "identity:path-missing",
          }),
        );
      }
      try {
        const path = await pathLibrary.upsert({
          id: payload.id,
          name: payload.name,
          notes: payload.notes,
          selectedResumeVersionId: payload.selectedResumeVersionId,
        });
        return ok({ path });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not save path", {
            message: cause instanceof Error ? cause.message : "Check the path name and try again.",
            detail: "identity:path-upsert",
            cause,
          }),
        );
      }
    },
    "identity.archivePath": async (payload) => {
      const pathLibrary = getPathLibrary();
      if (!pathLibrary) {
        return err(
          createAppError("unavailable", "Paths not ready", {
            message: "Path storage is not available yet.",
            detail: "identity:path-missing",
          }),
        );
      }
      try {
        const path = await pathLibrary.archive(payload.pathId);
        return ok({ path });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not archive path", {
            message:
              cause instanceof Error
                ? cause.message
                : "That path could not be archived. Try again.",
            detail: "identity:path-archive",
            cause,
          }),
        );
      }
    },
    "identity.selectPath": async (payload) => {
      const pathLibrary = getPathLibrary();
      if (!pathLibrary) {
        return err(
          createAppError("unavailable", "Paths not ready", {
            message: "Path storage is not available yet.",
            detail: "identity:path-missing",
          }),
        );
      }
      try {
        const path = await pathLibrary.select(payload.pathId);
        return ok({ path });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not select path", {
            message:
              cause instanceof Error
                ? cause.message
                : "That path could not be selected. Try again.",
            detail: "identity:path-select",
            cause,
          }),
        );
      }
    },
    "storage.getDataRoot": async () => ok({ dataRoot: await dataRoot.get() }),
    "storage.setDataRoot": async (payload) => {
      try {
        const next = await commitDataRoot(await dataRoot.set(payload.path));
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
      try {
        const next = await commitDataRoot(await dataRoot.reset());
        return ok({ dataRoot: next });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not restore data folder", {
            message:
              cause instanceof Error
                ? cause.message
                : "The default data folder could not be restored. Try again.",
            detail: "storage:dataRoot",
            cause,
          }),
        );
      }
    },
    "storage.pickDataRoot": async () => {
      try {
        const current = await dataRoot.get();
        const picked = await folderPicker.pickDirectory({
          title: "Choose JobJitsu data folder",
          defaultPath: current.path,
        });
        if (picked === null) {
          return ok({ dataRoot: null, cancelled: true });
        }
        const next = await commitDataRoot(await dataRoot.set(picked));
        return ok({ dataRoot: next, cancelled: false });
      } catch (cause) {
        return err(
          createAppError("unavailable", "Could not open folder picker", {
            message:
              cause instanceof Error
                ? cause.message
                : "Choose a folder in the desktop app, or enter a path on this device.",
            detail: "storage:pickDataRoot",
            cause,
          }),
        );
      }
    },
    "preferences.getApprovalBeforeSend": async () => {
      const preferences = getPreferences();
      if (!preferences) {
        return ok({ requireApprovalBeforeSend: true });
      }
      return ok({ requireApprovalBeforeSend: await preferences.getApprovalBeforeSend() });
    },
    "preferences.setApprovalBeforeSend": async (payload) => {
      const preferences = getPreferences();
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
    "preferences.getCraftPreferences": async () => {
      const preferences = getPreferences();
      if (!preferences) {
        return ok({ craft: { fitKeywords: [], tone: "", constraints: [] } });
      }
      return ok({ craft: await preferences.getCraftPreferences() });
    },
    "preferences.setCraftPreferences": async (payload) => {
      const preferences = getPreferences();
      if (!preferences) {
        return err(
          createAppError("unavailable", "Preferences not ready", {
            message: "Preferences storage is not available yet.",
            detail: "preferences:missing",
          }),
        );
      }
      try {
        const craft = await preferences.setCraftPreferences(payload);
        if (bus) {
          const keys = [
            payload.fitKeywords !== undefined ? "fitKeywords" : null,
            payload.tone !== undefined ? "tone" : null,
            payload.constraints !== undefined ? "constraints" : null,
          ].filter((key): key is string => key !== null);
          await bus.publish("Preferences.Changed", {
            keys: keys.length > 0 ? keys : ["fitKeywords", "tone", "constraints"],
          });
        }
        return ok({ craft });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not update craft preferences", {
            message:
              cause instanceof Error
                ? cause.message
                : "Those preferences could not be saved. Try again.",
            detail: "preferences:craft",
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
