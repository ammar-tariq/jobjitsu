import type { SettingsStore } from "@jobjitsu/config";
import type { EventBus } from "@jobjitsu/events";
import type { Logger } from "@jobjitsu/logger";
import type { PluginCapability } from "@jobjitsu/plugin-sdk";

/**
 * Host context passed to plugins/extensions.
 * Capability-gated; never implies send execute or AI access by default.
 */
export interface HostContext {
  readonly logger: Logger;
  readonly events: EventBus;
  readonly settings: SettingsStore;
  /** Capabilities granted for this load — fail closed if missing. */
  readonly granted: readonly PluginCapability[];
}

export const SDK_VERSION = "0.0.0" as const;
