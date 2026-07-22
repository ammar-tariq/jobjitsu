/**
 * Logging contracts — local, inspectable, PII-minimizing.
 * Never log résumé bodies or full career payloads.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  readonly [key: string]: string | number | boolean | null | undefined;
}

export interface LogRecord {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp?: string;
  readonly fields?: LogFields;
  /** Optional error without dumping sensitive payloads. */
  readonly error?: {
    readonly name?: string;
    readonly message?: string;
    readonly code?: string;
  };
}

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  child(fields: LogFields): Logger;
}

/** Sink for structured records (console, tests, later timeline bridge). */
export interface LogSink {
  write(record: LogRecord): void | Promise<void>;
}
