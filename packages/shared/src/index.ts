/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/shared" as const;

export type * from "./ids.js";
export type * from "./pipeline.js";
export type * from "./result.js";

export { createEntityId } from "./ids.js";
export { PIPELINE_STAGES, isPipelineStage } from "./pipeline.js";
export { createAppError, err, isErr, isOk, mapResult, ok } from "./result.js";
export { assertNever } from "./assert.js";
