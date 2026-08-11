import type { AiProvider } from "@jobjitsu/ai";
import {
  createContextAssembler,
  createFakeAiProvider,
  createOllamaAiProvider,
  listOllamaModels,
  createPathGatedAiProvider,
} from "@jobjitsu/ai";
import {
  createMemoryApplicationRepository,
  type ApplicationRepository,
} from "@jobjitsu/applications";
import {
  FoundationKeys,
  createErrorReporter,
  createServiceRegistry,
  type ServiceRegistry,
} from "@jobjitsu/core";
import {
  createInMemoryEventBus,
  type DomainEvent,
  type EventBus,
  type EventName,
  type EventPayloadMap,
} from "@jobjitsu/events";
import {
  createMemoryProfileRepository,
  createMemoryResumeLibrary,
  createMemoryPathLibrary,
  type PathLibrary,
  type ProfileRepository,
  type ResumeLibrary,
} from "@jobjitsu/identity";
import {
  createMemorySettingsStore,
  createPreferencesFacade,
  type PreferencesFacade,
} from "@jobjitsu/preferences";
import { DEFAULT_APP_SETTINGS } from "@jobjitsu/config";
import { createLogger, createMemoryLogSink, type Logger } from "@jobjitsu/logger";
import {
  createHostIpcDispatcher,
  createIpcBridge,
  type IpcBridge,
  type IpcDispatcher,
} from "../ipc/index.js";
import type { AiStatusSnapshot } from "../ipc/commands.js";
import { createMemoryAppearanceStore, type AppearanceStore } from "./appearance-store.js";
import { parseImportDraftWithAi } from "./parse-import-draft.js";
import { refineCraftChatWithAi } from "./craft-chat-refine.js";
import { generateCraftDraftsWithAi } from "./craft-generate.js";
import { generateApplicationCoverLetterWithAi } from "./cover-letter-application-draft.js";
import { tailorApplicationDraftWithAi } from "./tailor-application-draft.js";
import {
  createMemoryDataRootStore,
  type DataRootStore,
  type DataRootSnapshot,
} from "./data-root-store.js";
import { createHostFileSaver, type FileSaver } from "./file-saver.js";
import { createHostFolderPicker, type FolderPicker } from "./folder-picker.js";

export type HostActivityEntry = {
  readonly name: EventName;
  readonly occurredAt: string;
  readonly summary: string;
};

export type HostRuntime = {
  readonly bus: EventBus;
  readonly services: ServiceRegistry;
  readonly logger: Logger;
  /** Deny-by-default IPC dispatcher (ADR 0013). */
  readonly ipc: IpcDispatcher;
  /** Typed UI bridge — allowlisted methods only. */
  readonly bridge: IpcBridge;
  /** Appearance persistence stub (shared across restarts when injected). */
  readonly appearance: AppearanceStore;
  /** On-device profile repository (identity public API). */
  readonly profiles: ProfileRepository;
  /** On-device resume library (identity public API). */
  readonly resumeLibrary: ResumeLibrary;
  /** Career paths under identity (UI: Path). */
  readonly pathLibrary: PathLibrary;
  /** On-device application drafts. */
  readonly applications: ApplicationRepository;
  /** On-device data folder preference. */
  readonly dataRoot: DataRootStore;
  /** Preferences façade (config SSOT). */
  readonly preferences: PreferencesFacade;
  /** Start the host: App.Started → Agent readiness (no outbound send). */
  start(): Promise<void>;
  getActivity(): readonly HostActivityEntry[];
  subscribeActivity(listener: (entries: readonly HostActivityEntry[]) => void): () => void;
};

export type CreateHostRuntimeOptions = {
  readonly version?: string;
  readonly ai?: AiProvider;
  /** Shared appearance store so theme survives a process-local restart. */
  readonly appearance?: AppearanceStore;
  readonly profiles?: ProfileRepository;
  readonly resumeLibrary?: ResumeLibrary;
  readonly pathLibrary?: PathLibrary;
  readonly applications?: ApplicationRepository;
  readonly dataRoot?: DataRootStore;
  readonly preferences?: PreferencesFacade;
  readonly folderPicker?: FolderPicker;
  readonly fileSaver?: FileSaver;
  /** Rebind durable stores when the data folder changes. */
  readonly onDataRootChanged?: (snapshot: DataRootSnapshot) => Promise<void>;
  /**
   * Force the in-process fake Agent (tests / offline demos without Ollama).
   * Production desktop defaults to local Ollama (PE05-S06).
   */
  readonly useFakeAi?: boolean;
};

/**
 * Host composition root — owns AI and identity.
 * UI must only subscribe to `bus` / activity; never import `@jobjitsu/ai`.
 * Startup never sends mail — Agent readiness only (agent ≠ send).
 */
export function createHostRuntime(options: CreateHostRuntimeOptions = {}): HostRuntime {
  const bus = createInMemoryEventBus();
  const sink = createMemoryLogSink();
  const logger = createLogger(sink, { component: "host" });
  const services = createServiceRegistry();
  const errors = createErrorReporter({ logger });
  const defaultToFakeAi =
    options.useFakeAi === true ||
    (options.useFakeAi !== false &&
      typeof process !== "undefined" &&
      process.env.VITEST === "true");
  const preferences =
    options.preferences ??
    createPreferencesFacade(
      createMemorySettingsStore(
        defaultToFakeAi
          ? { ...DEFAULT_APP_SETTINGS, onboardingCompleted: true }
          : DEFAULT_APP_SETTINGS,
      ),
    );
  const folderPicker = options.folderPicker ?? createHostFolderPicker();
  const fileSaver = options.fileSaver ?? createHostFileSaver();
  const baseAi =
    options.ai ??
    (defaultToFakeAi
      ? createFakeAiProvider({ id: "fake-ai" })
      : createOllamaAiProvider({
          id: "ollama-local",
          getModelId: () => preferences.getLocalModelPath(),
        }));
  const ai = createPathGatedAiProvider({
    inner: baseAi,
    getLocalModelPath: () => preferences.getLocalModelPath(),
  });
  const assembler = createContextAssembler();
  const profiles = options.profiles ?? createMemoryProfileRepository();
  const resumeLibrary = options.resumeLibrary ?? createMemoryResumeLibrary();
  const pathLibrary = options.pathLibrary ?? createMemoryPathLibrary();
  const applications = options.applications ?? createMemoryApplicationRepository();
  const dataRootStore = options.dataRoot ?? createMemoryDataRootStore();

  services.register(FoundationKeys.logger, logger);
  services.register(FoundationKeys.eventBus, bus);
  services.register(FoundationKeys.errorReporter, errors);

  const activity: HostActivityEntry[] = [];
  const listeners = new Set<(entries: readonly HostActivityEntry[]) => void>();

  const pushActivity = (event: DomainEvent): void => {
    activity.push({
      name: event.name,
      occurredAt: event.occurredAt,
      summary: summarize(event),
    });
    const snapshot = [...activity];
    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  bus.subscribeAll((event) => {
    pushActivity(event);
  });

  // Startup — Agent readiness only. Never send or sync mail on boot.
  bus.subscribe("App.Started", async () => {
    logger.info("app started — loading foundation plugin");
    await bus.publish("Plugin.Loaded", {
      pluginId: "official.foundation.demo",
    });
  });

  bus.subscribe("Plugin.Loaded", async () => {
    logger.info("plugin loaded — checking Agent readiness (lazy; no model load yet)");
    await bus.publish("Ai.LocalModelLoading", { providerId: ai.id });

    const health = await ai.health();
    if (health.status !== "ready") {
      await bus.publish("Ai.LocalModelFailed", {
        providerId: ai.id,
        code: health.status,
      });
      return;
    }

    await bus.publish("Ai.LocalModelReady", {
      providerId: ai.id,
      locality: health.locality,
    });
  });

  const appearance = options.appearance ?? createMemoryAppearanceStore("dark");
  let aiStatus: AiStatusSnapshot = { ready: false, locality: "unavailable" };

  bus.subscribe("Ai.LocalModelLoading", async () => {
    aiStatus = { ready: false, locality: "unavailable" };
  });
  bus.subscribe("Ai.LocalModelFailed", async () => {
    aiStatus = { ready: false, locality: "unavailable" };
  });
  bus.subscribe("Ai.LocalModelReady", async (event) => {
    const payload = event.payload as EventPayloadMap["Ai.LocalModelReady"];
    aiStatus = {
      ready: true,
      locality: payload.locality === "remote" ? "remote" : "local",
    };
  });

  // Path change rechecks readiness only — does not load weights.
  bus.subscribe("Preferences.Changed", async (event) => {
    const payload = event.payload as EventPayloadMap["Preferences.Changed"];
    if (!payload.keys.includes("ai.localModelPath")) {
      return;
    }
    await bus.publish("Ai.LocalModelLoading", { providerId: ai.id });
    const health = await ai.health();
    if (health.status !== "ready") {
      await bus.publish("Ai.LocalModelFailed", {
        providerId: ai.id,
        code: health.status,
      });
      return;
    }
    await bus.publish("Ai.LocalModelReady", {
      providerId: ai.id,
      locality: health.locality,
    });
  });

  const ipc = createHostIpcDispatcher({
    appearance,
    profiles,
    resumeLibrary,
    pathLibrary,
    applications,
    dataRoot: dataRootStore,
    preferences,
    folderPicker,
    fileSaver,
    onDataRootChanged: options.onDataRootChanged,
    getAiStatus: () => aiStatus,
    listLocalModels: async () => {
      if (defaultToFakeAi) {
        return {
          models: ["qwen2.5:3b", "qwen3:8b"],
          listStatus: "ready" as const,
        };
      }
      const listed = await listOllamaModels();
      return {
        models: listed.models,
        listStatus: listed.status,
        message: listed.message,
      };
    },
    bus,
    parseImportDraft: (input) =>
      parseImportDraftWithAi({
        ai,
        assembler,
        input,
      }),
    tailorApplicationDraft: (input) =>
      tailorApplicationDraftWithAi({
        ai,
        assembler,
        repository: applications,
        bus,
        input,
      }),
    generateApplicationCoverLetter: (input) =>
      generateApplicationCoverLetterWithAi({
        ai,
        assembler,
        repository: applications,
        bus,
        input,
      }),
    generateCraftDrafts: (input) =>
      generateCraftDraftsWithAi({
        ai,
        assembler,
        input,
      }),
    refineCraftChat: (input) =>
      refineCraftChatWithAi({
        ai,
        assembler,
        input,
      }),
  });
  const bridge = createIpcBridge(ipc);

  return {
    bus,
    services,
    logger,
    ipc,
    bridge,
    appearance,
    profiles,
    resumeLibrary,
    pathLibrary,
    applications,
    dataRoot: dataRootStore,
    preferences,
    async start() {
      await bus.publish("App.Started", {
        version: options.version ?? "0.0.0",
      });
    },
    getActivity: () => [...activity],
    subscribeActivity(listener) {
      listeners.add(listener);
      listener([...activity]);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function summarize(event: DomainEvent): string {
  switch (event.name) {
    case "App.Started":
      return "Application started";
    case "Plugin.Loaded": {
      const payload = event.payload as EventPayloadMap["Plugin.Loaded"];
      return `Plugin loaded (${String(payload.pluginId)})`;
    }
    case "Resume.Generated": {
      const payload = event.payload as EventPayloadMap["Resume.Generated"];
      return `Resume generated (${payload.resumeId})`;
    }
    case "Resume.Imported": {
      const payload = event.payload as EventPayloadMap["Resume.Imported"];
      return `Resume imported (${payload.resumeId})`;
    }
    case "Resume.Attached": {
      const payload = event.payload as EventPayloadMap["Resume.Attached"];
      const targets = [payload.profileId ? "identity" : null, payload.pathId ? "path" : null]
        .filter(Boolean)
        .join(" + ");
      return `Resume attached (${payload.resumeId}${targets ? ` → ${targets}` : ""})`;
    }
    case "Email.Synced": {
      const payload = event.payload as EventPayloadMap["Email.Synced"];
      return `Email synced (${payload.messageCount} messages)`;
    }
    case "Application.DraftCreated": {
      const payload = event.payload as EventPayloadMap["Application.DraftCreated"];
      return `Application draft created (${payload.applicationId})`;
    }
    case "Application.Updated": {
      const payload = event.payload as EventPayloadMap["Application.Updated"];
      return `Application updated (${payload.applicationId})`;
    }
    case "Application.StageChanged": {
      const payload = event.payload as EventPayloadMap["Application.StageChanged"];
      return `Application stage → ${payload.stage} (${payload.applicationId})`;
    }
    case "Queue.Enqueued": {
      const payload = event.payload as EventPayloadMap["Queue.Enqueued"];
      return `Ready for review (${payload.applicationId})`;
    }
    case "Queue.Approved": {
      const payload = event.payload as EventPayloadMap["Queue.Approved"];
      return `Approved on this device (${payload.applicationId}) — nothing was sent`;
    }
    case "Queue.Rejected": {
      const payload = event.payload as EventPayloadMap["Queue.Rejected"];
      return `Returned to drafting (${payload.applicationId})`;
    }
    case "FollowUp.Scheduled": {
      const payload = event.payload as EventPayloadMap["FollowUp.Scheduled"];
      return `Follow-up scheduled for ${payload.notBefore}`;
    }
    case "FollowUp.Dismissed":
      return "Follow-up dismissed";
    case "Preferences.Changed":
      return "Preferences updated on this device";
    case "Ai.LocalModelReady":
      return "Agent ready on this device";
    case "Ai.LocalModelLoading":
      return "Agent checking readiness";
    case "Ai.LocalModelFailed":
      return "Agent unavailable — choose a model in Preferences";
    default:
      return event.name;
  }
}
