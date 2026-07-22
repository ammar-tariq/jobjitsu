# `@jobjitsu/events`

Typed domain event catalog, ID-centric payloads, **EventBus** contracts, and an in-process bus.

**Depends on:** `@jobjitsu/shared` (IDs, pipeline stages).

## Status

| Piece                                      | State                                      |
| ------------------------------------------ | ------------------------------------------ |
| Event names / payloads (EVENT_SYSTEM)      | Done (PE02-S02)                            |
| `EventBus` / `DurableEventSink` interfaces | Done                                       |
| `createInMemoryEventBus()`                 | Done — local only, no network              |
| `createMemoryDurableEventSink()`           | Done (PE02-S03) — in-memory allowlist hook |
| Timeline-backed durable sink               | Later (PE12)                               |

## Durable hook

```ts
import { createInMemoryEventBus, createMemoryDurableEventSink } from "@jobjitsu/events";

const sink = createMemoryDurableEventSink();
const bus = createInMemoryEventBus({ durableSink: sink });

await bus.publish("Send.Attempted", {
  applicationId: "…",
  destinationClass: "mail",
});
// sink.events() holds allowlisted facts only (egress / approval / pause / prefs / …)
```

Allowlist: `DURABLE_EVENT_NAMES` (egress, approval, pause, prefs, plugins, extensions, `Application.Submitted`).

## Laws

- On-device only — must not stream career payloads to the cloud
- ID-centric payloads (no résumé bodies on `Agent.Progress` / progress events)
- Durable subset includes all `Send.*`, `Privacy.EgressRecorded`, and `Application.Submitted`

See [docs/architecture/EVENT_SYSTEM.md](../../docs/architecture/EVENT_SYSTEM.md).
