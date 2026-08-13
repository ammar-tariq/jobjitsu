import {
  createApplicationDraft,
  deleteApplicationDraft,
  isApplicationLifecycleStatus,
  lifecycleLabel,
  resolveApplicationView,
  trackingStatusForStage,
  updateApplicationDraft,
  type Application,
  type ApplicationRepository,
} from "@jobjitsu/applications";
import type { MailboxService } from "@jobjitsu/mailbox";
import type { EventBus } from "@jobjitsu/events";
import type { PathLibrary, ProfileRepository, ResumeLibrary } from "@jobjitsu/identity";
import type { PreferencesFacade } from "@jobjitsu/preferences";
import {
  createAppError,
  createEntityId,
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
import { readResourceSnapshot } from "../host/resource-snapshot.js";
import { buildResumeExportArtifacts, toBase64 } from "../host/resume-export.js";
import {
  EMPTY_CRAFT_SESSION,
  type CraftSessionState,
  type CraftSessionStore,
} from "../host/craft-session.js";
import type {
  AiStatusSnapshot,
  ApplicationCoverLetterDraftInput,
  LocalModelsListResult,
  ApplicationSnapshot,
  ApplicationTailorDraftInput,
  CraftChatRefineInput,
  CraftChatRefineResult,
  CraftExportResumeResult,
  CraftGenerateInput,
  CraftGenerateResult,
  CraftSessionSnapshot,
  MailboxSettingsSnapshot,
  ResumeParseImportInputPayload,
  ResumeParseImportResult,
  ThemePreference,
} from "./commands.js";
import { createIpcDispatcher, type IpcDispatcher, type IpcHandlerMap } from "./dispatcher.js";

function toCraftSessionSnapshot(session: CraftSessionState): CraftSessionSnapshot {
  return {
    resumeText: session.resumeText,
    jobDescription: session.jobDescription,
    aboutCompany: session.aboutCompany,
    resumeDraft: session.resumeDraft,
    coverLetterDraft: session.coverLetterDraft,
    saveCompany: session.saveCompany,
    saveRole: session.saveRole,
    chatTarget: session.chatTarget,
    chatInput: session.chatInput,
    chatMessages: session.chatMessages.map((entry) => ({
      role: entry.role,
      content: entry.content,
    })),
    job: {
      status: session.job.status,
      phase: session.job.phase,
      kind: session.job.kind,
      message: session.job.message,
      startedAt: session.job.startedAt,
    },
  };
}

function toApplicationSnapshot(application: Application): ApplicationSnapshot {
  const resolved = resolveApplicationView(application);
  return {
    id: application.id,
    stage: application.stage,
    trackingStatus: trackingStatusForStage(application.stage),
    companyName: resolved.companyName,
    roleTitle: resolved.roleTitle,
    sourceUrl: application.sourceUrl,
    requisitionId: application.requisitionId,
    roleId: application.roleId,
    resumeVersionId: application.resumeVersionId,
    notes: application.notes,
    resumeDraftText: application.resumeDraftText,
    coverLetterDraftText: application.coverLetterDraftText,
    followUpAt: application.followUpAt,
    followUpDraftText: application.followUpDraftText,
    followUpId: application.followUpId,
    source: application.source,
    lifecycleStatus: resolved.lifecycleStatus,
    lifecycleLabel: resolved.lifecycleStatus ? lifecycleLabel(resolved.lifecycleStatus) : undefined,
    companyDomain: resolved.companyDomain,
    appliedAt: resolved.appliedAt,
    lastActivityAt: application.lastActivityAt,
    nextAction: application.nextAction,
    nextActionDueAt: application.nextActionDueAt,
    recruiterName: resolved.recruiterName,
    recruiterEmail: resolved.recruiterEmail,
    confidence: application.confidence,
    archived: application.archived,
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
  /**
   * Host-owned Ollama model list (PE05-S07). UI never calls the network.
   * When omitted, list returns calm unavailable.
   */
  readonly listLocalModels?: () => Promise<LocalModelsListResult>;
  readonly profiles?: ProfileRepository;
  readonly getProfiles?: () => ProfileRepository | undefined;
  readonly resumeLibrary?: ResumeLibrary;
  readonly getResumeLibrary?: () => ResumeLibrary | undefined;
  readonly pathLibrary?: PathLibrary;
  readonly getPathLibrary?: () => PathLibrary | undefined;
  readonly applications?: ApplicationRepository;
  readonly getApplications?: () => ApplicationRepository | undefined;
  readonly mailbox?: MailboxService;
  readonly getMailbox?: () => MailboxService | undefined;
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
   * Host-owned cover letter draft (PE08-S02). UI never calls AI directly.
   * When omitted, generate returns calm unavailable.
   */
  readonly generateApplicationCoverLetter?: (input: ApplicationCoverLetterDraftInput) => Promise<{
    readonly application: Application | null;
    readonly draftText: string;
    readonly coverLetterStatus: "ready" | "unavailable" | "failed";
  }>;
  /**
   * Host-owned Craft Studio generate (PE28-S01). UI never calls AI directly.
   * When omitted, generate returns calm unavailable.
   */
  readonly generateCraftDrafts?: (input: CraftGenerateInput) => Promise<CraftGenerateResult>;
  /** Host-owned Craft session — survives navigation while Agent prepares. */
  readonly craftSession?: CraftSessionStore;
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
  const listLocalModels = options.listLocalModels;
  const getProfiles = options.getProfiles ?? (() => options.profiles);
  const getResumeLibrary = options.getResumeLibrary ?? (() => options.resumeLibrary);
  const getPathLibrary = options.getPathLibrary ?? (() => options.pathLibrary);
  const getApplications = options.getApplications ?? (() => options.applications);
  const getMailbox = options.getMailbox ?? (() => options.mailbox);
  const dataRoot = options.dataRoot ?? createMemoryDataRootStore();
  const getPreferences = options.getPreferences ?? (() => options.preferences);
  const folderPicker = options.folderPicker ?? createHostFolderPicker();
  const fileSaver = options.fileSaver ?? createHostFileSaver();
  const bus = options.bus;
  const onDataRootChanged = options.onDataRootChanged;
  const parseImportDraft = options.parseImportDraft;
  const tailorApplicationDraft = options.tailorApplicationDraft;
  const generateApplicationCoverLetter = options.generateApplicationCoverLetter;
  const generateCraftDrafts = options.generateCraftDrafts;
  const craftSession = options.craftSession;
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
    "ai.listLocalModels": async () => {
      if (!listLocalModels) {
        return ok({
          models: [],
          listStatus: "unavailable" as const,
          message: "Ollama is not reachable on this device. Start Ollama, then refresh the list.",
        });
      }
      try {
        return ok(await listLocalModels());
      } catch {
        return ok({
          models: [],
          listStatus: "unavailable" as const,
          message: "Ollama is not reachable on this device. Start Ollama, then refresh the list.",
        });
      }
    },
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
    "preferences.getOnboardingCompleted": async () => {
      const preferences = getPreferences();
      if (!preferences) {
        return ok({ completed: false });
      }
      return ok({ completed: await preferences.getOnboardingCompleted() });
    },
    "preferences.setOnboardingCompleted": async (payload) => {
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
        const completed = await preferences.setOnboardingCompleted(payload.completed);
        if (bus) {
          await bus.publish("Preferences.Changed", { keys: ["onboardingCompleted"] });
        }
        return ok({ completed });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not update onboarding", {
            message:
              cause instanceof Error
                ? cause.message
                : "That preference could not be saved. Try again.",
            detail: "preferences:onboarding",
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
    "resources.get": async () => {
      const resources = await readResourceSnapshot();
      return ok({ resources });
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
            resumeDraftText: payload.resumeDraftText,
            coverLetterDraftText: payload.coverLetterDraftText,
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
        const existing = await applications.get(payload.id as ApplicationId);
        let followUpId: string | null | undefined;
        let followUpAt: string | null | undefined = payload.followUpAt;
        if (payload.followUpAt === null) {
          followUpId = null;
          followUpAt = null;
        } else if (payload.followUpAt !== undefined) {
          const trimmed = payload.followUpAt.trim();
          if (!trimmed) {
            followUpAt = null;
            followUpId = null;
          } else {
            followUpAt = trimmed;
            followUpId = existing?.followUpId ?? createEntityId("followup");
          }
        }
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
            coverLetterDraftText: payload.coverLetterDraftText,
            followUpAt,
            followUpDraftText: payload.followUpDraftText,
            followUpId,
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
    "applications.deleteDraft": async (payload) => {
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
        const deleted = await deleteApplicationDraft({
          repository: applications,
          bus,
          id: payload.id as ApplicationId,
        });
        return ok({ deleted });
      } catch (cause) {
        return err(
          createAppError("validation", "Could not delete application", {
            message:
              cause instanceof Error
                ? cause.message
                : "That application draft could not be removed. Try again.",
            detail: "applications:delete",
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
    "applications.generateCoverLetter": async (payload) => {
      if (!generateApplicationCoverLetter) {
        return ok({
          application: null,
          draftText: "",
          coverLetterStatus: "unavailable" as const,
        });
      }
      try {
        const result = await generateApplicationCoverLetter(payload);
        return ok({
          application: result.application ? toApplicationSnapshot(result.application) : null,
          draftText: result.draftText,
          coverLetterStatus: result.coverLetterStatus,
        });
      } catch {
        return ok({
          application: null,
          draftText: "",
          coverLetterStatus: "failed" as const,
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
    "craft.getSession": async () => {
      const session = craftSession?.get() ?? EMPTY_CRAFT_SESSION;
      return ok({ session: toCraftSessionSnapshot(session) });
    },
    "craft.patchSession": async (payload) => {
      if (!craftSession) {
        return ok({ session: toCraftSessionSnapshot(EMPTY_CRAFT_SESSION) });
      }
      const session = craftSession.patch({
        ...(payload.resumeText !== undefined ? { resumeText: payload.resumeText } : {}),
        ...(payload.jobDescription !== undefined ? { jobDescription: payload.jobDescription } : {}),
        ...(payload.aboutCompany !== undefined ? { aboutCompany: payload.aboutCompany } : {}),
        ...(payload.resumeDraft !== undefined ? { resumeDraft: payload.resumeDraft } : {}),
        ...(payload.coverLetterDraft !== undefined
          ? { coverLetterDraft: payload.coverLetterDraft }
          : {}),
        ...(payload.saveCompany !== undefined ? { saveCompany: payload.saveCompany } : {}),
        ...(payload.saveRole !== undefined ? { saveRole: payload.saveRole } : {}),
        ...(payload.chatTarget !== undefined ? { chatTarget: payload.chatTarget } : {}),
        ...(payload.chatInput !== undefined ? { chatInput: payload.chatInput } : {}),
        ...(payload.chatMessages !== undefined ? { chatMessages: payload.chatMessages } : {}),
      });
      return ok({ session: toCraftSessionSnapshot(session) });
    },
    "craft.prepareDrafts": async (payload) => {
      if (!craftSession) {
        return ok({
          session: toCraftSessionSnapshot({
            ...EMPTY_CRAFT_SESSION,
            job: {
              status: "unavailable",
              phase: null,
              kind: payload.kind,
              message: "Agent is not ready yet. Check Preferences for the on-device model name.",
              startedAt: null,
            },
          }),
        });
      }
      const session = craftSession.prepareDrafts(payload.kind);
      return ok({ session: toCraftSessionSnapshot(session) });
    },
    "applications.merge": async (payload) => {
      const mailbox = getMailbox();
      if (!mailbox) {
        return ok({ application: null });
      }
      const application = await mailbox.mergeApplications(payload.targetId, payload.sourceId);
      return ok({ application: application ? toApplicationSnapshot(application) : null });
    },
    "applications.archive": async (payload) => {
      const mailbox = getMailbox();
      if (!mailbox) {
        return ok({ application: null });
      }
      const application = await mailbox.archiveApplication(payload.id);
      return ok({ application: application ? toApplicationSnapshot(application) : null });
    },
    "applications.override": async (payload) => {
      const mailbox = getMailbox();
      if (!mailbox) {
        return ok({ application: null });
      }
      if (payload.lifecycleStatus && !isApplicationLifecycleStatus(payload.lifecycleStatus)) {
        return err(
          createAppError("validation", "Unknown application status", {
            message: "That status is not recognized. Try again.",
            detail: "applications:lifecycle",
          }),
        );
      }
      const application = await mailbox.overrideApplication(payload.id, {
        companyName: payload.companyName,
        roleTitle: payload.roleTitle,
        lifecycleStatus: payload.lifecycleStatus
          ? isApplicationLifecycleStatus(payload.lifecycleStatus)
            ? payload.lifecycleStatus
            : undefined
          : undefined,
        appliedAt: payload.appliedAt,
        recruiterName: payload.recruiterName,
        recruiterEmail: payload.recruiterEmail,
      });
      return ok({ application: application ? toApplicationSnapshot(application) : null });
    },
    "mailbox.listIntegrations": async () => {
      const mailbox = getMailbox();
      if (!mailbox) {
        return ok({ integrations: [] });
      }
      const integrations = await mailbox.listIntegrations();
      return ok({ integrations: integrations.map(toIntegrationSnapshot) });
    },
    "mailbox.connectSample": async () => {
      const mailbox = getMailbox();
      if (!mailbox) {
        return err(
          createAppError("unavailable", "Mailbox not ready", {
            message: "Email intelligence is not available yet.",
            detail: "mailbox:missing",
          }),
        );
      }
      const integration = await mailbox.connectSampleMailbox();
      return ok({ integration: toIntegrationSnapshot(integration) });
    },
    "mailbox.beginConnect": async (payload) => {
      const mailbox = getMailbox();
      if (!mailbox) {
        return ok({
          status: "unavailable",
          message: "Email intelligence is not available yet.",
        });
      }
      return ok(await mailbox.beginProviderConnect(payload.provider));
    },
    "mailbox.connectProvider": async (payload) => {
      const mailbox = getMailbox();
      if (!mailbox) {
        return err(
          createAppError("unavailable", "Mailbox not ready", {
            message: "Email intelligence is not available yet.",
            detail: "mailbox:missing",
          }),
        );
      }
      const integration = await mailbox.connectProvider({
        provider: payload.provider,
        tokens: { accessToken: payload.accessToken, refreshToken: payload.refreshToken },
        emailAddress: payload.emailAddress,
      });
      return ok({ integration: toIntegrationSnapshot(integration) });
    },
    "mailbox.sync": async (payload) => {
      const mailbox = getMailbox();
      if (!mailbox) {
        return err(
          createAppError("unavailable", "Mailbox not ready", {
            message: "Email intelligence is not available yet.",
            detail: "mailbox:missing",
          }),
        );
      }
      const started = await mailbox.sync(payload.id);
      const integration = await mailbox.waitForSync(started.id);
      return ok({ integration: toIntegrationSnapshot(integration) });
    },
    "mailbox.getIntegration": async (payload) => {
      const mailbox = getMailbox();
      const integration = mailbox ? await mailbox.getIntegration(payload.id) : undefined;
      return ok({ integration: integration ? toIntegrationSnapshot(integration) : null });
    },
    "mailbox.disconnect": async (payload) => {
      const mailbox = getMailbox();
      const integration = mailbox ? await mailbox.disconnect(payload.id) : undefined;
      return ok({ integration: integration ? toIntegrationSnapshot(integration) : null });
    },
    "mailbox.deleteData": async (payload) => {
      const mailbox = getMailbox();
      if (mailbox) {
        await mailbox.deleteImportedData(payload.id);
      }
      return ok({ deleted: true });
    },
    "mailbox.getDashboard": async () => {
      const mailbox = getMailbox();
      if (!mailbox) {
        return ok({
          dashboard: {
            summary: {
              totalApplications: 0,
              activeApplications: 0,
              interviews: 0,
              assessments: 0,
              offers: 0,
              rejected: 0,
              awaitingResponse: 0,
              actionsRequired: 0,
            },
            funnel: { applied: 0, responses: 0, interviews: 0, offers: 0 },
            actions: [],
            duplicates: [],
            analytics: {
              windowDays: 30,
              applications: 0,
              responses: 0,
              responseRate: 0,
              interviews: 0,
              interviewRate: 0,
              offers: 0,
              offerRate: 0,
            },
            integrations: [],
          },
        });
      }
      const dashboard = await mailbox.dashboard();
      return ok({
        dashboard: {
          summary: dashboard.summary,
          funnel: dashboard.funnel,
          actions: dashboard.actions.map(toActionSnapshot),
          duplicates: dashboard.duplicates,
          analytics: {
            windowDays: dashboard.analytics.windowDays,
            applications: dashboard.analytics.applications,
            responses: dashboard.analytics.responses,
            responseRate: dashboard.analytics.responseRate,
            interviews: dashboard.analytics.interviews,
            interviewRate: dashboard.analytics.interviewRate,
            offers: dashboard.analytics.offers,
            offerRate: dashboard.analytics.offerRate,
          },
          integrations: dashboard.integrations.map(toIntegrationSnapshot),
        },
      });
    },
    "mailbox.listActions": async () => {
      const mailbox = getMailbox();
      const actions = mailbox ? await mailbox.listActions() : [];
      return ok({ actions: actions.map(toActionSnapshot) });
    },
    "mailbox.completeAction": async (payload) => {
      const mailbox = getMailbox();
      const action = mailbox ? await mailbox.completeAction(payload.id) : undefined;
      return ok({ action: action ? toActionSnapshot(action) : null });
    },
    "mailbox.listTimeline": async (payload) => {
      const mailbox = getMailbox();
      const events = mailbox ? await mailbox.listTimeline(payload.applicationId) : [];
      return ok({
        events: events.map((event) => ({
          id: event.id,
          type: event.type,
          at: event.at,
          summary: event.summary,
          emailId: event.emailId,
          flagged: event.flagged,
        })),
      });
    },
    "mailbox.listLinkedEmails": async (payload) => {
      const mailbox = getMailbox();
      const emails = mailbox ? await mailbox.listLinkedEmails(payload.applicationId) : [];
      return ok({ emails: emails.map(toEmailSnapshot) });
    },
    "mailbox.listRecentEmails": async (payload) => {
      const mailbox = getMailbox();
      const emails =
        mailbox && "listRecentEmails" in mailbox
          ? await mailbox.listRecentEmails(payload?.limit)
          : [];
      return ok({ emails: emails.map(toEmailSnapshot) });
    },
    "mailbox.getEmail": async (payload) => {
      const mailbox = getMailbox();
      const email = mailbox ? await mailbox.getEmail(payload.id) : undefined;
      return ok({ email: email ? toEmailSnapshot(email) : null });
    },
    "mailbox.confirmMatch": async (payload) => {
      const mailbox = getMailbox();
      const email = mailbox
        ? await mailbox.confirmMatch(payload.emailId, payload.applicationId)
        : undefined;
      return ok({ email: email ? toEmailSnapshot(email) : null });
    },
    "mailbox.keepSeparate": async (payload) => {
      const mailbox = getMailbox();
      const email = mailbox ? await mailbox.keepSeparate(payload.emailId) : undefined;
      return ok({ email: email ? toEmailSnapshot(email) : null });
    },
    "mailbox.dismissDuplicate": async (payload) => {
      const mailbox = getMailbox();
      if (mailbox) {
        await mailbox.dismissDuplicatePair(payload.leftId, payload.rightId);
      }
      return ok({ dismissed: true });
    },
    "mailbox.getSettings": async () => {
      const mailbox = getMailbox();
      if (!mailbox) {
        return ok({
          settings: {
            lookbackDays: 365,
            noResponseAfterDays: 7,
            notifyAssessments: true,
            notifyInterviews: true,
            notifyRejections: true,
            notifyOffers: true,
          },
        });
      }
      return ok({ settings: toSettingsSnapshot(await mailbox.getSettings()) });
    },
    "mailbox.updateSettings": async (payload) => {
      const mailbox = getMailbox();
      if (!mailbox) {
        return ok({
          settings: {
            lookbackDays: 365,
            noResponseAfterDays: 7,
            notifyAssessments: true,
            notifyInterviews: true,
            notifyRejections: true,
            notifyOffers: true,
          },
        });
      }
      const settings = await mailbox.updateSettings(payload);
      return ok({ settings: toSettingsSnapshot(settings) });
    },
    "system.getResources": async () => {
      return ok({ resources: await readResourceSnapshot() });
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

function toSettingsSnapshot(settings: {
  readonly gmailClientId?: string;
  readonly gmailClientSecret?: string;
  readonly outlookClientId?: string;
  readonly lookbackDays: number;
  readonly noResponseAfterDays: number;
  readonly notifyAssessments: boolean;
  readonly notifyInterviews: boolean;
  readonly notifyRejections: boolean;
  readonly notifyOffers: boolean;
}): MailboxSettingsSnapshot {
  return {
    gmailClientId: settings.gmailClientId,
    gmailClientSecret: settings.gmailClientSecret,
    outlookClientId: settings.outlookClientId,
    lookbackDays: settings.lookbackDays,
    noResponseAfterDays: settings.noResponseAfterDays,
    notifyAssessments: settings.notifyAssessments,
    notifyInterviews: settings.notifyInterviews,
    notifyRejections: settings.notifyRejections,
    notifyOffers: settings.notifyOffers,
  };
}

function toIntegrationSnapshot(integration: {
  readonly id: string;
  readonly provider: string;
  readonly label: string;
  readonly emailAddress?: string;
  readonly connected: boolean;
  readonly lastSyncedAt?: string;
  readonly syncStatus: string;
  readonly syncError?: string;
  readonly emailsProcessed: number;
  readonly emailsTotal?: number;
  readonly jobRelatedCount: number;
  readonly applicationsFound: number;
}) {
  return {
    id: integration.id,
    provider: integration.provider,
    label: integration.label,
    emailAddress: integration.emailAddress,
    connected: integration.connected,
    lastSyncedAt: integration.lastSyncedAt,
    syncStatus: integration.syncStatus,
    syncError: integration.syncError,
    emailsProcessed: integration.emailsProcessed,
    emailsTotal: integration.emailsTotal,
    jobRelatedCount: integration.jobRelatedCount,
    applicationsFound: integration.applicationsFound,
  };
}

function toActionSnapshot(action: {
  readonly id: string;
  readonly applicationId?: string;
  readonly emailId?: string;
  readonly actionType: string;
  readonly priority: string;
  readonly description: string;
  readonly dueAt?: string;
  readonly completed: boolean;
}) {
  return {
    id: action.id,
    applicationId: action.applicationId,
    emailId: action.emailId,
    actionType: action.actionType,
    priority: action.priority,
    description: action.description,
    dueAt: action.dueAt,
    completed: action.completed,
  };
}

function toEmailSnapshot(email: {
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
  readonly processed?: boolean;
  readonly isJobRelated?: boolean;
  readonly company?: string;
  readonly jobTitle?: string;
  readonly applicationId?: string;
}) {
  return {
    id: email.id,
    subject: email.subject,
    senderEmail: email.senderEmail,
    senderName: email.senderName,
    snippet: email.snippet,
    bodyText: email.bodyText,
    receivedAt: email.receivedAt,
    sentAt: email.sentAt,
    direction: email.direction,
    classification: email.classification,
    matchUncertain: email.matchUncertain,
    processed: email.processed,
    isJobRelated: email.isJobRelated,
    company: email.company,
    jobTitle: email.jobTitle,
    applicationId: email.applicationId,
  };
}
