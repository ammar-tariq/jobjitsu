# `@jobjitsu/plugin-sdk`

Plugin manifest, capability, skill, and host contracts.

## Status

Interfaces + capability constants only — **no loader implementation**.

## Hard rules

- Off until user-enabled
- Fail closed on missing capabilities
- `send.request` may create intents — never `send.execute` / mark success

See [docs/architecture/PLUGIN_ARCHITECTURE.md](../../docs/architecture/PLUGIN_ARCHITECTURE.md).
