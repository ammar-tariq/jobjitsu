# `@jobjitsu/events`

Typed domain event catalog, payloads, and **EventBus** / **DurableEventSink** interfaces.

## Status

Contracts only — **no bus implementation**.

## Laws

- On-device only — must not stream career payloads to the cloud
- ID-centric payloads (no résumé bodies on progress events)
- Durable subset includes all `Send.*` and `Privacy.EgressRecorded`

See [docs/architecture/EVENT_SYSTEM.md](../../docs/architecture/EVENT_SYSTEM.md).
