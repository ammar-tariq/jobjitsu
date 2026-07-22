import type { DurableEventName, EventName } from "./names.js";
import type { DomainEvent, EventHandler, EventPayloadMap, Unsubscribe } from "./payloads.js";

/**
 * In-process typed event bus.
 * Must not transmit career payloads off-device.
 */
export interface EventBus {
  publish<N extends EventName>(name: N, payload: EventPayloadMap[N]): void | Promise<void>;

  subscribe<N extends EventName>(name: N, handler: EventHandler<N>): Unsubscribe;

  /** Subscribe to all events (UI batching, timeline bridge). */
  subscribeAll(handler: EventHandler): Unsubscribe;
}

/**
 * Optional durable sink for trust/timeline — implementations live elsewhere.
 */
export interface DurableEventSink {
  persist(event: DomainEvent<DurableEventName>): void | Promise<void>;
}

export interface EventBusOptions {
  readonly durableSink?: DurableEventSink;
  readonly durableNames?: readonly DurableEventName[];
}
