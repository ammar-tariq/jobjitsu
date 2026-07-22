/**
 * UI-safe error contract — no stack traces as user-facing titles.
 */
export type AppErrorCode =
  | "unknown"
  | "not_found"
  | "validation"
  | "permission"
  | "unavailable"
  | "cancelled"
  | "egress_denied"
  | "egress_failed"
  | "egress_unknown"
  | "provider_misconfigured"
  | "plugin_denied";

export interface AppError {
  readonly code: AppErrorCode;
  /** Short human title (≤ ~8 words). */
  readonly title: string;
  /** Optional recovery hint. */
  readonly message?: string;
  /** Safe machine detail for logs — never résumé bodies. */
  readonly detail?: string;
  readonly cause?: unknown;
}

export type Result<T, E = AppError> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}

export function createAppError(
  code: AppErrorCode,
  title: string,
  extras: Omit<AppError, "code" | "title"> = {},
): AppError {
  return { code, title, ...extras };
}

export function mapResult<T, U, E>(result: Result<T, E>, map: (value: T) => U): Result<U, E> {
  return result.ok ? ok(map(result.value)) : result;
}
