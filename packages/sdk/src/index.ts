/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/sdk" as const;

export type { HostContext } from "./host-context.js";
export { SDK_VERSION } from "./host-context.js";

/** Shared foundations */
export type {
  AppError,
  AppErrorCode,
  ApplicationId,
  EntityId,
  PipelineStage,
  PluginId,
  Result,
} from "@jobjitsu/shared";
export {
  PIPELINE_STAGES,
  createAppError,
  createEntityId,
  err,
  isErr,
  isOk,
  ok,
} from "@jobjitsu/shared";

/** Events */
export type { EventBus, EventName, EventPayloadMap } from "@jobjitsu/events";
export { EVENT_NAMES, createInMemoryEventBus } from "@jobjitsu/events";

/** Logger */
export type { Logger, LogSink } from "@jobjitsu/logger";
export { createLogger, createMemoryLogSink } from "@jobjitsu/logger";

/** Config */
export type { AppSettings, SettingsStore } from "@jobjitsu/config";
export { DEFAULT_APP_SETTINGS, createMemorySettingsStore } from "@jobjitsu/config";

/** Core kernel helpers */
export type { ErrorReporter, ServiceRegistry } from "@jobjitsu/core";
export { FoundationKeys, createErrorReporter, createServiceRegistry } from "@jobjitsu/core";

/** Plugin contracts (no AI runtime) */
export type {
  PluginCapability,
  PluginHost,
  PluginManifest,
  PluginSkill,
  PluginSkillContext,
} from "@jobjitsu/plugin-sdk";
export { FORBIDDEN_IMPLICIT_EGRESS_CAPS, PLUGIN_CAPABILITIES } from "@jobjitsu/plugin-sdk";
