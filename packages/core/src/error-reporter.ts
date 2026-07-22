import type { AppError } from "@jobjitsu/shared";
import { createAppError } from "@jobjitsu/shared";
import type { Logger } from "@jobjitsu/logger";

export interface ErrorReport {
  readonly error: AppError;
  readonly reportedAt: string;
}

export interface ErrorReporter {
  report(error: unknown, context?: { readonly source?: string }): AppError;
  /** Recent reports (ring buffer) — local only. */
  recent(): readonly ErrorReport[];
}

export type CreateErrorReporterOptions = {
  readonly logger?: Logger;
  readonly capacity?: number;
};

/**
 * Local error reporter — maps unknowns to UI-safe AppError; no cloud upload.
 */
export function createErrorReporter(options: CreateErrorReporterOptions = {}): ErrorReporter {
  const capacity = options.capacity ?? 50;
  const reports: ErrorReport[] = [];

  return {
    report(error, context) {
      const mapped = mapToAppError(error, context?.source);
      options.logger?.error(mapped.title, {
        code: mapped.code,
        detail: mapped.detail,
        source: context?.source,
      });
      reports.push({ error: mapped, reportedAt: new Date().toISOString() });
      if (reports.length > capacity) {
        reports.shift();
      }
      return mapped;
    },
    recent: () => [...reports],
  };
}

function mapToAppError(error: unknown, source?: string): AppError {
  if (isAppError(error)) {
    return error;
  }
  if (error instanceof Error) {
    return createAppError("unknown", "Something went wrong", {
      message: "Try again, or check Logs.",
      detail: source ? `${source}: ${error.name}` : error.name,
      cause: error,
    });
  }
  return createAppError("unknown", "Something went wrong", {
    message: "Try again, or check Logs.",
    detail: source,
  });
}

function isAppError(value: unknown): value is AppError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "title" in value &&
    typeof (value as AppError).code === "string" &&
    typeof (value as AppError).title === "string"
  );
}
