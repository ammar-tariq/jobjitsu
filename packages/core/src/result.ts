/**
 * UI-safe error contract — no stack traces as user-facing titles.
 * Implementations map to brand error copy later.
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
