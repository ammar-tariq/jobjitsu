/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/preferences" as const;

/** Settings live in `@jobjitsu/config` — re-exported for domain consumers. */
export type * from "@jobjitsu/config";
export {
  DEFAULT_APP_SETTINGS,
  createMemorySettingsStore,
  defaultSettingsPolicy,
  isInQuietHours,
  requiresApprovalBeforeSend,
} from "@jobjitsu/config";

export { createPreferencesFacade } from "./facade.js";
export type { PreferencesFacade } from "./facade.js";
