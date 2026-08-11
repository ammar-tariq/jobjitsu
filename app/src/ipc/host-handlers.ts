import {
  createApplicationDraft,
  trackingStatusForStage,
  updateApplicationDraft,
  type Application,
  type ApplicationRepository,
} from "@jobjitsu/applications";
import type { EventBus } from "@jobjitsu/events";
import type { PathLibrary, ProfileRepository, ResumeLibrary } from "@jobjitsu/identity";
import type { PreferencesFacade } from "@jobjitsu/preferences";
import {
  createAppError,
  err,
  isPipelineStage,
  ok,
  type ApplicationId,
  type RoleId,
} from "@jobjitsu/shared";
import { createMemoryAppearanceStore, type AppearanceStore } from "../host/appearance-store.js";
import {
  createMemoryDataRootStore,
  type DataRootSnapshot,
  type DataRootStore,
} from "../host/data-root-store.js";
import { createHostFileSaver, type FileSaver } from "../host/file-saver.js";
import { createHostFolderPicker, type FolderPicker } from "../host/folder-picker.js";
import { buildResumeExportArtifacts, toBase64 } from "../host/resume-export.js";
import type {
  AiStatusSnapshot,
  ApplicationSnapshot,
  ApplicationTailorDraftInput,
  CraftChatRefineInput,
  CraftChatRefineResult,
  CraftExportResumeResult,
  CraftGenerateInput,
  CraftGenerateResult,
  ResumeParseImportInputPayload,
  ResumeParseImportResult,
  ThemePreference,
} from "./commands.js";
import { createIpcDispatcher, type IpcDispatcher, type IpcHandlerMap } from "./dispatcher.js";

function toApplicationSnapshot(application: Application): ApplicationSnapshot {
  return {
    id: application.id,
    stage: application.stage,
    trackingStatus: trackingStatusForStage(application.stage),
    companyName: application.companyName,
    roleTitle: application.roleTitle,
    sourceUrl: application.sourceUrl,
    requisitionId: application.requisitionId,
    roleId: application.roleId,
    resumeVersionId: application.resumeVersionId,
    notes: application.notes,
    resumeDraftText: application.resumeDraftText,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}

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
  readonly applications?: ApplicationRepository;
  readonly getApplications?: () => ApplicationRepository | undefined;
  readonly dataRoot?: DataRootStore;
  readonly preferences?: PreferencesFacade;
  readonly getPreferences?: () => PreferencesFacade | undefined;
  readonly folderPicker?: FolderPicker;
  readonly fileSaver?: FileSaver;
  /**
   * After the data-folder preference changes — rebind durable stores under the new path.
   */
  readonly onDataRootChanged?: (snapshot: DataRootSnapshot) => Promise<void>;
  /** When set, successful imports emit Resume.Imported (id only). */
  readonly bus?: EventBus;
  /**
   * Host-owned import parse (PE03-S10). UI never calls AI directly.
   * When omitted, parse returns calm unavailable/manual empty fields.
   */
  readonly parseImportDraft?: (
    input: ResumeParseImportInputPayload,
  ) => Promise<ResumeParseImportResult>;
  /**
   * Host-owned résumé tailor (PE03-S04). UI never calls AI directly.
   * When omitted, tailor returns calm unavailable.
   */
  readonly tailorApplicationDraft?: (input: ApplicationTailorDraftInput) => Promise<{
    readonly application: Application | null;
    readonly draftText: string;
    readonly tailorStatus: "ready" | "unavailable" | "failed";
  }>;
  /**
   * Host-owned Craft Studio generate (PE28-S01). UI never calls AI directly.
   * When omitted, generate returns calm unavailable.
   */
  readonly generateCraftDrafts?: (input: CraftGenerateInput) => Promise<CraftGenerateResult>;
  /**
   * Host-owned Craft chat refine (PE28-S03). UI never calls AI directly.
   * When omitted, chat returns calm unavailable.
   */
  readonly refineCraftChat?: (input: CraftChatRefineInput) => Promise<CraftChatRefineResult>;
};

/**
 * Host IPC handlers — allowlisted only; UI never gets AI complete.
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
  const getApplications = options.getApplications ?? (() => options.applications);
  const dataRoot = options.dataRoot ?? createMemoryDataRootStore();
  const getPreferences = options.getPreferences ?? (() => options.preferences);
  const folderPicker = options.folderPicker ?? createHostFolderPicker();
  const fileSaver = options.fileSaver ?? createHostFileSaver();
  const bus = options.bus;
  const onDataRootChanged = options.onDataRootChanged;
  const parseImportDraft = options.parseImportDraft;
  const tailorApplicationDraft = options.tailorApplicationDraft;
  const generateCraftDrafts = options.generateCraftDrafts;
  const refineCraftChat = options.refineCraftChat;

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
    "identity.listProfiles": async () => {
      const profiles = getProfiles();
      if (!profiles) {
        return ok({ profiles: [], selectedId: null });
      }
      const listed = await profiles.list();
      const selected = await profiles.get();
      return ok({ profiles: listed, selectedId: selected?.id ?? null });
    },
    "identity.selectProfile": async (payload) => {
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
        const profile = await profiles.select(payload.profileId);
        return ok({ profile });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not select profile", {
            message:
              cause instanceof Error
                ? cause.message
                : "That profile could not be selected. Try again.",
            detail: "identity:select-profile",
            cause,
          }),
        );
      }
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
        const profile = await profiles.upsert({
          id: payload.id,
          displayName: payload.displayName,
          email: payload.email,
          location: payload.location,
          createNew: payload.createNew,
        });
        if (payload.createNew === true || payload.id) {
          await profiles.select(profile.id);
        }
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
        const pathLibrary = getPathLibrary();
        const path =
          payload.pathId && pathLibrary ? await pathLibrary.get(payload.pathId) : undefined;
        const version = await resumeLibrary.import({
          label: payload.label,
          fileName: payload.fileName,
          bytes,
          contentType: payload.contentType,
          parentVersionId: payload.parentVersionId,
          pathId: payload.pathId,
          profileId: path?.profileId,
          contactName: payload.contactName,
          contactEmail: payload.contactEmail,
          notes: payload.notes,
          source: payload.source,
        });
        // PE03-S06: import stores the version only. Path/identity attach is PE03-S07.
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
    "identity.parseImportDraft": async (payload) => {
      if (!parseImportDraft) {
        return ok({
          contactName: "",
          contactEmail: "",
          notes: "",
          parseStatus: "unavailable" as const,
        });
      }
      try {
        const draft = await parseImportDraft(payload);
        return ok(draft);
      } catch {
        return ok({
          contactName: "",
          contactEmail: "",
          notes: "",
          parseStatus: "manual" as const,
        });
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
    "identity.attachResume": async (payload) => {
      const resumeLibrary = getResumeLibrary();
      if (!resumeLibrary) {
        return err(
          createAppError("unavailable", "Resume library not ready", {
            message: "Resume storage is not available yet.",
            detail: "identity:resume-missing",
          }),
        );
      }
      const updateIdentity = payload.updateIdentity === true;
      const pathId = payload.pathId?.trim() || undefined;
      if (!updateIdentity && !pathId) {
        return err(
          createAppError("validation", "Choose where to attach", {
            message: "Pick identity, a path, or both before attaching.",
            detail: "identity:attach-empty",
          }),
        );
      }
      try {
        const version = await resumeLibrary.get(payload.resumeId);
        if (!version) {
          throw new Error(
            "That resume version is not in your library. Pick another and try again.",
          );
        }

        let profile: {
          id: string;
          displayName: string;
          email?: string;
          location?: string;
          updatedAt: string;
        } | null = null;
        if (updateIdentity) {
          const profiles = getProfiles();
          if (!profiles) {
            return err(
              createAppError("unavailable", "Profile not ready", {
                message: "Identity storage is not available yet.",
                detail: "identity:missing",
              }),
            );
          }
          const existing = (await profiles.getById(version.profileId)) ?? (await profiles.get());
          const displayName = (version.contactName ?? existing?.displayName ?? "").trim();
          if (!displayName) {
            throw new Error("Add a display name on the resume review before updating identity.");
          }
          profile = await profiles.upsert({
            id: existing?.id ?? version.profileId,
            displayName,
            email: version.contactEmail ?? existing?.email,
          });
          await profiles.select(profile.id);
        }

        let path: {
          id: string;
          profileId: string;
          name: string;
          notes?: string;
          archived: boolean;
          updatedAt: string;
          selectedResumeVersionId?: string;
        } | null = null;
        if (pathId) {
          const pathLibrary = getPathLibrary();
          if (!pathLibrary) {
            return err(
              createAppError("unavailable", "Paths not ready", {
                message: "Path storage is not available yet.",
                detail: "identity:path-missing",
              }),
            );
          }
          const existingPath = await pathLibrary.get(pathId);
          if (!existingPath) {
            throw new Error("That path is not in your library. Pick another and try again.");
          }
          path = await pathLibrary.upsert({
            id: existingPath.id,
            name: existingPath.name,
            notes: existingPath.notes,
            profileId: existingPath.profileId,
            selectedResumeVersionId: version.id,
          });
          await pathLibrary.select(path.id);
          await resumeLibrary.select(version.id);
        }

        if (bus) {
          await bus.publish("Resume.Attached", {
            resumeId: version.id,
            profileId: profile?.id,
            pathId: path?.id,
          });
        }

        return ok({ version, profile: profile ?? null, path: path ?? null });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not attach resume", {
            message:
              cause instanceof Error
                ? cause.message
                : "That resume could not be attached. Try again.",
            detail: "identity:attach",
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
        const profiles = getProfiles();
        const selectedProfile = profiles ? await profiles.get() : undefined;
        const path = await pathLibrary.upsert({
          id: payload.id,
          name: payload.name,
          notes: payload.notes,
          profileId: payload.profileId ?? selectedProfile?.id,
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
    "preferences.getLocalModelPath": async () => {
      const preferences = getPreferences();
      if (!preferences) {
        return ok({ path: null });
      }
      return ok({ path: (await preferences.getLocalModelPath()) ?? null });
    },
    "preferences.setLocalModelPath": async (payload) => {
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
        const path = (await preferences.setLocalModelPath(payload.path)) ?? null;
        if (bus) {
          await bus.publish("Preferences.Changed", { keys: ["ai.localModelPath"] });
        }
        return ok({ path });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not update model path", {
            message:
              cause instanceof Error
                ? cause.message
                : "That model path could not be saved. Try again.",
            detail: "preferences:localModelPath",
            cause,
          }),
        );
      }
    },
    "applications.list": async () => {
      const applications = getApplications();
      if (!applications) {
        return ok({ applications: [] });
      }
      const listed = await applications.list();
      return ok({ applications: listed.map(toApplicationSnapshot) });
    },
    "applications.createDraft": async (payload) => {
      const applications = getApplications();
      if (!applications) {
        return err(
          createAppError("unavailable", "Applications not ready", {
            message: "Application storage is not available yet.",
            detail: "applications:missing",
          }),
        );
      }
      try {
        const result = await createApplicationDraft({
          repository: applications,
          bus,
          input: {
            companyName: payload.companyName,
            roleTitle: payload.roleTitle,
            sourceUrl: payload.sourceUrl,
            requisitionId: payload.requisitionId,
            roleId: payload.roleId ? (payload.roleId as RoleId) : undefined,
            resumeVersionId: payload.resumeVersionId,
            notes: payload.notes,
          },
        });
        return ok({
          application: toApplicationSnapshot(result.application),
          duplicateWarning: result.duplicateWarning
            ? {
                matchedApplicationId: result.duplicateWarning.matchedApplicationId,
                message: result.duplicateWarning.message,
              }
            : undefined,
        });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not create application", {
            message:
              cause instanceof Error
                ? cause.message
                : "That application draft could not be created. Try again.",
            detail: "applications:create",
            cause,
          }),
        );
      }
    },
    "applications.updateDraft": async (payload) => {
      const applications = getApplications();
      if (!applications) {
        return err(
          createAppError("unavailable", "Applications not ready", {
            message: "Application storage is not available yet.",
            detail: "applications:missing",
          }),
        );
      }
      if (payload.stage !== undefined && !isPipelineStage(payload.stage)) {
        return err(
          createAppError("validation", "Unknown application stage", {
            message: "That stage is not recognized. Try again.",
            detail: "applications:stage",
          }),
        );
      }
      try {
        const result = await updateApplicationDraft({
          repository: applications,
          bus,
          patch: {
            id: payload.id as ApplicationId,
            companyName: payload.companyName,
            roleTitle: payload.roleTitle,
            sourceUrl: payload.sourceUrl,
            requisitionId: payload.requisitionId,
            roleId:
              payload.roleId === null
                ? null
                : payload.roleId
                  ? (payload.roleId as RoleId)
                  : undefined,
            resumeVersionId: payload.resumeVersionId,
            notes: payload.notes,
            resumeDraftText: payload.resumeDraftText,
            stage: payload.stage && isPipelineStage(payload.stage) ? payload.stage : undefined,
          },
        });
        return ok({
          application: toApplicationSnapshot(result.application),
          duplicateWarning: result.duplicateWarning
            ? {
                matchedApplicationId: result.duplicateWarning.matchedApplicationId,
                message: result.duplicateWarning.message,
              }
            : undefined,
        });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not update application", {
            message:
              cause instanceof Error
                ? cause.message
                : "That application draft could not be updated. Try again.",
            detail: "applications:update",
            cause,
          }),
        );
      }
    },
    "applications.tailorDraft": async (payload) => {
      if (!tailorApplicationDraft) {
        return ok({
          application: null,
          draftText: "",
          tailorStatus: "unavailable" as const,
        });
      }
      try {
        const result = await tailorApplicationDraft(payload);
        return ok({
          application: result.application ? toApplicationSnapshot(result.application) : null,
          draftText: result.draftText,
          tailorStatus: result.tailorStatus,
        });
      } catch {
        return ok({
          application: null,
          draftText: "",
          tailorStatus: "failed" as const,
        });
      }
    },
    "craft.generate": async (payload) => {
      if (!generateCraftDrafts) {
        return ok({
          resumeDraft: "",
          coverLetterDraft: "",
          craftStatus: "unavailable" as const,
          message: "Agent is not ready yet. Check Preferences for the on-device model name.",
        });
      }
      try {
        return ok(await generateCraftDrafts(payload));
      } catch {
        return ok({
          resumeDraft: "",
          coverLetterDraft: "",
          craftStatus: "failed" as const,
          message: "Could not prepare those drafts. Try again when you are ready.",
        });
      }
    },
    "craft.exportResume": async (payload) => {
      const empty: CraftExportResumeResult = {
        html: "",
        pdfBase64: "",
        fileName: "",
        savedPath: null,
        exportStatus: "invalid",
        message: "Add a résumé draft before exporting.",
      };
      try {
        const artifacts = buildResumeExportArtifacts(payload.draftText);
        if (!artifacts) {
          return ok(empty);
        }
        const fileName =
          payload.format === "pdf"
            ? `${artifacts.fileNameBase}.pdf`
            : `${artifacts.fileNameBase}.html`;
        const base: CraftExportResumeResult = {
          html: artifacts.html,
          pdfBase64: toBase64(artifacts.pdfBytes),
          fileName,
          savedPath: null,
          exportStatus: "ready",
        };
        if (!payload.save) {
          return ok(base);
        }
        const saved =
          payload.format === "pdf"
            ? await fileSaver.saveBytes({
                defaultPath: fileName,
                contents: artifacts.pdfBytes,
                title: "Save résumé PDF on this device",
                filters: [{ name: "PDF", extensions: ["pdf"] }],
              })
            : await fileSaver.saveText({
                defaultPath: fileName,
                contents: artifacts.html,
                title: "Save résumé HTML on this device",
                filters: [{ name: "HTML", extensions: ["html"] }],
              });
        if (saved.status === "cancelled") {
          return ok({
            ...base,
            exportStatus: "cancelled",
            message: "Export cancelled. Nothing was saved.",
          });
        }
        if (saved.status === "unavailable") {
          return ok({
            ...base,
            exportStatus: "unavailable",
            message: saved.message,
          });
        }
        return ok({
          ...base,
          savedPath: saved.path,
          exportStatus: "saved",
          message: "Saved on this device. Nothing was sent.",
        });
      } catch {
        return ok({
          ...empty,
          exportStatus: "failed",
          message: "Could not export that draft. Try again.",
        });
      }
    },
    "craft.chatRefine": async (payload) => {
      if (!refineCraftChat) {
        return ok({
          chatStatus: "unavailable" as const,
          assistantMessage:
            "Agent is not ready yet. Check Preferences for the on-device model name.",
          clarifyingQuestions: [],
          resumeDraft: payload.resumeDraft,
          coverLetterDraft: payload.coverLetterDraft,
        });
      }
      try {
        return ok(await refineCraftChat(payload));
      } catch {
        return ok({
          chatStatus: "failed" as const,
          assistantMessage: "Could not refine that draft. Try again when you are ready.",
          clarifyingQuestions: [],
          resumeDraft: payload.resumeDraft,
          coverLetterDraft: payload.coverLetterDraft,
        });
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
