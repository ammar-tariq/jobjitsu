/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/core" as const;

export type * from "./ids.js";
export type * from "./pipeline.js";
export type * from "./result.js";
export type * from "./logging.js";

export { PIPELINE_STAGES } from "./pipeline.js";
