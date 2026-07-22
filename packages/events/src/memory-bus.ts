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
 * Handlers run in subscription order; async handlers are awaited so cascades stay sequential.
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

  const publish = async <N extends EventName>(
    name: N,
    payload: EventPayloadMap[N],
  ): Promise<void> => {
    const event: DomainEvent<N> = {
      name,
      payload,
      occurredAt: new Date().toISOString(),
    };

    // Observers first so facts appear before nested work they trigger.
    for (const handler of all) {
      await handler(event as DomainEvent);
    }

    const specific = named.get(name);
    if (specific) {
      for (const handler of specific) {
        await handler(event as DomainEvent);
      }
    }

    if (durableSink && isDurableName(name, durableNames)) {
      await durableSink.persist(event as DomainEvent<DurableEventName>);
    }
  };

  return { publish, subscribe, subscribeAll };
}
