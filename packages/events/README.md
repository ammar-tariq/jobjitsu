# `@jobjitsu/events`

Typed domain event catalog, ID-centric payloads, **EventBus** contracts, and an in-process bus.

**Depends on:** `@jobjitsu/shared` (IDs, pipeline stages).

## Status

| Piece                                      | State                         |
| ------------------------------------------ | ----------------------------- |
| Event names / payloads (EVENT_SYSTEM)      | Done (PE02-S02)               |
| `EventBus` / `DurableEventSink` interfaces | Done                          |
| `createInMemoryEventBus()`                 | Done — local only, no network |
| Timeline-backed durable sink               | Later (PE02-S03 / PE12)       |

## Usage

```ts
import { createInMemoryEventBus } from "@jobjitsu/events";

const bus = createInMemoryEventBus();
bus.subscribe("Queue.Enqueued", (e) => {
  console.log(e.payload.applicationId);
});
void bus.publish("Queue.Enqueued", { applicationId: "…" });
```

## Laws

- On-device only — must not stream career payloads to the cloud
- ID-centric payloads (no résumé bodies on `Agent.Progress` / progress events)
- Durable subset includes all `Send.*`, `Privacy.EgressRecorded`, and `Application.Submitted`

See [docs/architecture/EVENT_SYSTEM.md](../../docs/architecture/EVENT_SYSTEM.md).
