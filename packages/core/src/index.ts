/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/core" as const;

/** Re-export shared foundations for existing consumers. */
export type * from "@jobjitsu/shared";
export {
  PIPELINE_STAGES,
  assertNever,
  createAppError,
  createEntityId,
  err,
  isErr,
  isOk,
  isPipelineStage,
  mapResult,
  ok,
} from "@jobjitsu/shared";

/** Re-export logger contracts for backward compatibility. */
export type { LogFields, LogLevel, LogRecord, LogSink, Logger } from "@jobjitsu/logger";

export type { ErrorReport, ErrorReporter } from "./error-reporter.js";
export { createErrorReporter } from "./error-reporter.js";

export type { ServiceKey, ServiceRegistry } from "./registry.js";
export { FoundationKeys, createServiceKey, createServiceRegistry } from "./registry.js";
