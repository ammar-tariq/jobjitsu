/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/logger" as const;

export type * from "./types.js";

export { createConsoleLogSink, createLogger, createMemoryLogSink } from "./create-logger.js";
