# `@jobjitsu/events`

Typed domain event catalog, payloads, **EventBus** contracts, and an in-process implementation.

**Depends on:** `@jobjitsu/shared` (IDs, pipeline stages).

## Status

| Piece                                      | State              |
| ------------------------------------------ | ------------------ |
| Event names / payloads                     | Done               |
| `EventBus` / `DurableEventSink` interfaces | Done               |
| `createInMemoryEventBus()`                 | Done (E02-F03-S01) |
| Timeline-backed durable sink               | Not yet            |

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
- ID-centric payloads (no résumé bodies on progress events)
- Durable subset includes all `Send.*` and `Privacy.EgressRecorded`

See [docs/architecture/EVENT_SYSTEM.md](../../docs/architecture/EVENT_SYSTEM.md).
