import type { AiProvider } from "@jobjitsu/ai";
import {
  createAiProviderRegistry,
  createFakeAiProvider,
  createFakeContextAssembler,
} from "@jobjitsu/ai";
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
  createDefaultFakeResume,
  createFakeResumeStore,
  createMemoryProfileRepository,
  createMemoryResumeLibrary,
  type ProfileRepository,
  type ResumeLibrary,
  type ResumeStore,
} from "@jobjitsu/identity";
import { createLogger, createMemoryLogSink, type Logger } from "@jobjitsu/logger";
import { createFakeGmailChannel, type FakeGmailChannel } from "@jobjitsu/send";
import type { ApplicationId } from "@jobjitsu/shared";
import {
  createHostIpcDispatcher,
  createIpcBridge,
  type IpcBridge,
  type IpcDispatcher,
} from "../ipc/index.js";
import { createMemoryAppearanceStore, type AppearanceStore } from "./appearance-store.js";
import { createMemoryDataRootStore, type DataRootStore } from "./data-root-store.js";
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
  /** On-device data folder preference. */
  readonly dataRoot: DataRootStore;
  /** Start the demo cascade: App.Started → … → Email.Synced */
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
  readonly dataRoot?: DataRootStore;
  readonly folderPicker?: FolderPicker;
};

/**
 * Host composition root — owns AI, identity, and send fakes.
 * UI must only subscribe to `bus` / activity; never import `@jobjitsu/ai`.
 */
export function createHostRuntime(options: CreateHostRuntimeOptions = {}): HostRuntime {
  const bus = createInMemoryEventBus();
  const sink = createMemoryLogSink();
  const logger = createLogger(sink, { component: "host" });
  const services = createServiceRegistry();
  const errors = createErrorReporter({ logger });
  const ai = options.ai ?? createFakeAiProvider({ id: "fake-ai" });
  const aiRegistry = createAiProviderRegistry([ai]);
  const assembler = createFakeContextAssembler();
  const resumes: ResumeStore = createFakeResumeStore({ resume: null });
  const gmail: FakeGmailChannel = createFakeGmailChannel();
  const profiles = options.profiles ?? createMemoryProfileRepository();
  const resumeLibrary = options.resumeLibrary ?? createMemoryResumeLibrary();
  const dataRootStore = options.dataRoot ?? createMemoryDataRootStore();
  const folderPicker = options.folderPicker ?? createHostFolderPicker();

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

  // Event cascade — AI only runs inside host handlers, never from UI.
  bus.subscribe("App.Started", async () => {
    logger.info("app started — loading foundation plugin");
    await bus.publish("Plugin.Loaded", {
      pluginId: "official.foundation.demo",
    });
  });

  bus.subscribe("Plugin.Loaded", async () => {
    logger.info("plugin loaded — generating résumé via host AI");
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

    const seed = createDefaultFakeResume();
    const prompt = assembler.assemble({
      role: "generic",
      resumeExcerpts: [seed.summary ?? seed.headline ?? seed.fullName],
    });
    const completion = await aiRegistry.getActive()?.complete({
      role: "generic",
      prompt,
    });

    const generated = await resumes.saveResume({
      ...seed,
      summary: completion?.text ?? seed.summary,
    });

    await bus.publish("Resume.Generated", { resumeId: generated.id });
  });

  bus.subscribe("Resume.Generated", async () => {
    logger.info("resume ready — syncing fake mailbox");
    const result = await gmail.send({
      applicationId: "app_bootstrap" as ApplicationId,
      to: "inbox@example.com",
      subject: "JobJitsu fake sync",
      body: "Local fake mailbox handshake",
      destinationClass: "mail",
    });

    if (result.ok) {
      await bus.publish("Email.Synced", {
        channelId: gmail.id,
        messageCount: gmail.outbox.length,
      });
    } else {
      errors.report(result.error, { source: "fake-gmail-sync" });
    }
  });

  const appearance = options.appearance ?? createMemoryAppearanceStore("dark");
  const ipc = createHostIpcDispatcher({
    appearance,
    profiles,
    resumeLibrary,
    dataRoot: dataRootStore,
    folderPicker,
    bus,
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
    dataRoot: dataRootStore,
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
    case "Email.Synced": {
      const payload = event.payload as EventPayloadMap["Email.Synced"];
      return `Email synced (${payload.messageCount} messages)`;
    }
    case "Ai.LocalModelReady":
      return "Agent runtime ready (fake)";
    case "Ai.LocalModelLoading":
      return "Agent runtime loading";
    default:
      return event.name;
  }
}
