import { DURABLE_EVENT_NAMES, type DurableEventName, type EventName } from "./names.js";
import type { EventBus, EventBusOptions } from "./bus.js";
import type { DomainEvent, EventHandler, EventPayloadMap, Unsubscribe } from "./payloads.js";

function isDurableName(
  name: EventName,
  durableNames: ReadonlySet<EventName>,
): name is DurableEventName {
  return durableNames.has(name);
}

/**
 * In-process event bus — local only, no network I/O.
 * Handlers for a given publish run synchronously in subscription order.
 */
export function createInMemoryEventBus(options: EventBusOptions = {}): EventBus {
  const named = new Map<EventName, Set<EventHandler>>();
  const all = new Set<EventHandler>();
  const durableNames = new Set<EventName>(options.durableNames ?? DURABLE_EVENT_NAMES);
  const durableSink = options.durableSink;

  const subscribe = <N extends EventName>(name: N, handler: EventHandler<N>): Unsubscribe => {
    let set = named.get(name);
    if (!set) {
      set = new Set();
      named.set(name, set);
    }
    set.add(handler as EventHandler);
    return () => {
      set?.delete(handler as EventHandler);
    };
  };

  const subscribeAll = (handler: EventHandler): Unsubscribe => {
    all.add(handler);
    return () => {
      all.delete(handler);
    };
  };

  const publish = <N extends EventName>(
    name: N,
    payload: EventPayloadMap[N],
  ): void | Promise<void> => {
    const event: DomainEvent<N> = {
      name,
      payload,
      occurredAt: new Date().toISOString(),
    };

    const specific = named.get(name);
    if (specific) {
      for (const handler of specific) {
        void handler(event as DomainEvent);
      }
    }
    for (const handler of all) {
      void handler(event as DomainEvent);
    }

    if (durableSink && isDurableName(name, durableNames)) {
      return durableSink.persist(event as DomainEvent<DurableEventName>);
    }
  };

  return { publish, subscribe, subscribeAll };
}
