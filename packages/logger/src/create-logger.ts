import type { LogFields, LogLevel, LogRecord, LogSink, Logger } from "./types.js";

function mergeFields(
  base: LogFields | undefined,
  extra: LogFields | undefined,
): LogFields | undefined {
  if (!base && !extra) {
    return undefined;
  }
  return { ...base, ...extra };
}

/**
 * Structured logger — writes to a local sink only.
 * No network; never attach résumé bodies in `fields`.
 */
export function createLogger(sink: LogSink, baseFields?: LogFields): Logger {
  const write = (level: LogLevel, message: string, fields?: LogFields): void => {
    const record: LogRecord = {
      level,
      message,
      timestamp: new Date().toISOString(),
      fields: mergeFields(baseFields, fields),
    };
    void sink.write(record);
  };

  return {
    debug: (message, fields) => {
      write("debug", message, fields);
    },
    info: (message, fields) => {
      write("info", message, fields);
    },
    warn: (message, fields) => {
      write("warn", message, fields);
    },
    error: (message, fields) => {
      write("error", message, fields);
    },
    child: (fields) => createLogger(sink, mergeFields(baseFields, fields)),
  };
}

/** Console sink — local stdout/stderr only. */
export function createConsoleLogSink(): LogSink {
  return {
    write(record) {
      const line = `[${record.level}] ${record.message}`;
      const payload = record.fields ? { ...record.fields } : undefined;
      if (record.level === "error") {
        console.error(line, payload ?? "");
      } else if (record.level === "warn") {
        console.warn(line, payload ?? "");
      } else {
        console.info(line, payload ?? "");
      }
    },
  };
}

/** In-memory sink for tests — no I/O. */
export function createMemoryLogSink(): LogSink & { readonly records: readonly LogRecord[] } {
  const records: LogRecord[] = [];
  return {
    get records() {
      return records;
    },
    write(record) {
      records.push(record);
    },
  };
}
