/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/config" as const;

export type * from "./settings.js";

export {
  DEFAULT_APP_SETTINGS,
  defaultSettingsPolicy,
  isInQuietHours,
  requiresApprovalBeforeSend,
} from "./settings.js";

export { createMemorySettingsStore } from "./memory-store.js";
