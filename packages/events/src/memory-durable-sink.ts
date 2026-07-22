import type { DurableEventSink } from "./bus.js";
import type { DurableEventName } from "./names.js";
import type { DomainEvent } from "./payloads.js";

export type MemoryDurableEventSink = DurableEventSink & {
  /** Snapshot of persisted durable events (local only). */
  readonly events: () => readonly DomainEvent<DurableEventName>[];
  clear(): void;
};

/**
 * In-memory durable sink for tests and host bootstrapping.
 * Does not write to disk or network — Timeline wiring comes later (PE12).
 */
export function createMemoryDurableEventSink(): MemoryDurableEventSink {
  const stored: DomainEvent<DurableEventName>[] = [];

  return {
    persist(event) {
      stored.push(event);
    },
    events() {
      return [...stored];
    },
    clear() {
      stored.length = 0;
    },
  };
}
