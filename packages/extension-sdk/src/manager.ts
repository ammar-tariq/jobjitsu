import type { EventBus } from "@jobjitsu/events";
import { createLogger, createMemoryLogSink, type Logger } from "@jobjitsu/logger";
import { createAppError, err, ok, type Result } from "@jobjitsu/shared";
import { createServiceKey, createServiceRegistry, type ServiceRegistry } from "@jobjitsu/core";
import {
  isContributionPoint,
  type ContributionPoint,
  type ContributionRecord,
  type ContributionTypeMap,
} from "./contributions.js";
import { createExtensionContext, type ExtensionContext } from "./context.js";
import type {
  ExtensionDefinition,
  ExtensionRecord,
  ExtensionRegistrationApi,
  ExtensionState,
} from "./lifecycle.js";

export type ExtensionManager = {
  /** Install definition (disabled). Fail-closed on duplicates / bad manifests. */
  register(definition: ExtensionDefinition): Promise<Result<void>>;
  /** Activate contributions. */
  enable(extensionId: string): Promise<Result<void>>;
  /** Revoke contributions; keep definition. */
  disable(extensionId: string): Promise<Result<void>>;
  /** Disable if needed, unload hooks, forget. */
  unregister(extensionId: string): Promise<Result<void>>;
  list(): readonly ExtensionRecord[];
  get(extensionId: string): ExtensionRecord | undefined;
  isEnabled(extensionId: string): boolean;
  getContributions<P extends ContributionPoint>(point: P): Result<readonly ContributionRecord<P>[]>;
};

export type CreateExtensionManagerOptions = {
  readonly services?: ServiceRegistry;
  readonly logger?: Logger;
  /** Optional domain bus — publishes Extension.* events when provided. */
  readonly eventBus?: EventBus;
};

type InternalExtension = {
  readonly definition: ExtensionDefinition;
  state: ExtensionState;
  context: ExtensionContext;
};

export const ExtensionServiceKeys = {
  manager: createServiceKey<ExtensionManager>("jobjitsu.extensionManager"),
} as const;

/**
 * In-process extension manager — starts empty; fail-closed.
 * Does not ship or load any real product extensions.
 */
export function createExtensionManager(
  options: CreateExtensionManagerOptions = {},
): ExtensionManager {
  const parentServices = options.services ?? createServiceRegistry();
  const extensions = new Map<string, InternalExtension>();
  const contributions = new Map<ContributionPoint, Map<string, ContributionRecord>>();

  for (const point of [
    "discovery.source",
    "send.channel",
    "agent.skill",
    "ui.panel",
    "ui.status",
    "timeline.exporter",
    "scheduler.jobType",
  ] as const satisfies readonly ContributionPoint[]) {
    contributions.set(point, new Map());
  }

  const publish = async (
    name:
      | "Extension.Registered"
      | "Extension.Enabled"
      | "Extension.Disabled"
      | "Extension.Unloaded"
      | "Extension.Failed",
    payload: { extensionId: string; code?: string; message?: string },
  ): Promise<void> => {
    if (!options.eventBus) {
      return;
    }
    if (name === "Extension.Failed") {
      await options.eventBus.publish(name, {
        extensionId: payload.extensionId,
        code: payload.code,
        message: payload.message,
      });
      return;
    }
    await options.eventBus.publish(name, { extensionId: payload.extensionId });
  };

  const clearContributions = (extensionId: string): void => {
    for (const byId of contributions.values()) {
      for (const [key, record] of byId) {
        if (record.extensionId === extensionId) {
          byId.delete(key);
        }
      }
    }
  };

  const toRecord = (ext: InternalExtension): ExtensionRecord => ({
    id: ext.definition.manifest.id,
    manifest: ext.definition.manifest,
    state: ext.state,
  });

  const fail = async (
    extensionId: string,
    code: "validation" | "not_found" | "permission" | "unknown",
    title: string,
    message?: string,
  ): Promise<Result<never>> => {
    await publish("Extension.Failed", {
      extensionId,
      code,
      message: message ?? title,
    });
    return err(createAppError(code, title, { message }));
  };

  const manager: ExtensionManager = {
    async register(definition) {
      const { manifest } = definition;
      if (!manifest.id || !manifest.name || !manifest.version) {
        return fail(
          manifest.id || "unknown",
          "validation",
          "Invalid extension manifest",
          "id, name, and version are required",
        );
      }

      for (const contrib of manifest.contributes) {
        if (!isContributionPoint(contrib.type)) {
          return fail(manifest.id, "validation", "Unknown contribution point", contrib.type);
        }
      }

      if (extensions.has(manifest.id)) {
        return fail(manifest.id, "validation", "Extension already registered");
      }

      const logger = options.logger ?? createLogger(createMemoryLogSink());

      const context = createExtensionContext({
        extensionId: manifest.id,
        logger,
        parentServices,
      });

      extensions.set(manifest.id, {
        definition,
        state: "registered",
        context,
      });

      try {
        await definition.onRegister?.(context);
      } catch (cause) {
        extensions.delete(manifest.id);
        return fail(
          manifest.id,
          "unknown",
          "Extension register hook failed",
          cause instanceof Error ? cause.message : undefined,
        );
      }

      await publish("Extension.Registered", { extensionId: manifest.id });
      return ok(undefined);
    },

    async enable(extensionId) {
      const ext = extensions.get(extensionId);
      if (!ext) {
        return fail(extensionId, "not_found", "Extension not found");
      }
      if (ext.state === "enabled") {
        return ok(undefined);
      }

      const pending: ContributionRecord[] = [];

      const api: ExtensionRegistrationApi = {
        context: ext.context,
        contribute(point, id, contribution) {
          if (!isContributionPoint(point)) {
            throw new Error(`Unknown contribution point: ${String(point)}`);
          }
          if (contribution.kind !== point) {
            throw new Error(
              `Contribution kind mismatch: expected ${point}, got ${contribution.kind}`,
            );
          }
          const declared = ext.definition.manifest.contributes.some(
            (c) => c.type === point && c.id === id,
          );
          if (!declared) {
            throw new Error(`Contribution not declared in manifest: ${point}/${id}`);
          }
          const bucket = contributions.get(point);
          if (!bucket) {
            throw new Error(`Unknown contribution point: ${point}`);
          }
          if (bucket.has(id) && bucket.get(id)?.extensionId !== extensionId) {
            throw new Error(`Contribution id already taken: ${point}/${id}`);
          }
          pending.push({
            point,
            id,
            extensionId,
            contribution,
          } as ContributionRecord);
        },
        registerService(key, value) {
          ext.context.registerService(key, value);
        },
      };

      try {
        await ext.definition.register?.(api);
        for (const record of pending) {
          contributions.get(record.point)?.set(record.id, record);
        }
        await ext.definition.onEnable?.(ext.context);
      } catch (cause) {
        clearContributions(extensionId);
        return fail(
          extensionId,
          "permission",
          "Extension enable failed",
          cause instanceof Error ? cause.message : undefined,
        );
      }

      ext.state = "enabled";
      await publish("Extension.Enabled", { extensionId });
      return ok(undefined);
    },

    async disable(extensionId) {
      const ext = extensions.get(extensionId);
      if (!ext) {
        return fail(extensionId, "not_found", "Extension not found");
      }
      if (ext.state !== "enabled") {
        ext.state = "disabled";
        return ok(undefined);
      }

      clearContributions(extensionId);
      try {
        await ext.definition.onDisable?.(ext.context);
      } catch (cause) {
        return fail(
          extensionId,
          "unknown",
          "Extension disable hook failed",
          cause instanceof Error ? cause.message : undefined,
        );
      }

      ext.state = "disabled";
      await publish("Extension.Disabled", { extensionId });
      return ok(undefined);
    },

    async unregister(extensionId) {
      const ext = extensions.get(extensionId);
      if (!ext) {
        return fail(extensionId, "not_found", "Extension not found");
      }

      if (ext.state === "enabled") {
        const disabled = await manager.disable(extensionId);
        if (!disabled.ok) {
          return disabled;
        }
      }

      try {
        await ext.definition.onUnload?.(ext.context);
      } catch (cause) {
        return fail(
          extensionId,
          "unknown",
          "Extension unload hook failed",
          cause instanceof Error ? cause.message : undefined,
        );
      }

      extensions.delete(extensionId);
      await publish("Extension.Unloaded", { extensionId });
      return ok(undefined);
    },

    list() {
      return [...extensions.values()].map(toRecord);
    },

    get(extensionId) {
      const ext = extensions.get(extensionId);
      return ext ? toRecord(ext) : undefined;
    },

    isEnabled(extensionId) {
      return extensions.get(extensionId)?.state === "enabled";
    },

    getContributions(point) {
      if (!isContributionPoint(point)) {
        return err(
          createAppError("validation", "Unknown contribution point", {
            detail: String(point),
          }),
        );
      }
      const bucket = contributions.get(point);
      const list = bucket ? [...bucket.values()] : [];
      return ok(list as ContributionRecord<typeof point>[]);
    },
  };

  return manager;
}

/** Type helper so contribute() stays aligned with ContributionTypeMap. */
export type ContributeFn = <P extends ContributionPoint>(
  point: P,
  id: string,
  contribution: ContributionTypeMap[P],
) => void;
