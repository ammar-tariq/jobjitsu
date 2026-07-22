/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/plugin-sdk" as const;

export type * from "./manifest.js";
export { FORBIDDEN_IMPLICIT_EGRESS_CAPS, PLUGIN_CAPABILITIES } from "./manifest.js";
