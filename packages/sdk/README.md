# `@jobjitsu/sdk`

Public SDK surface for first-party and future third-party plugins.

## Includes

- Shared `Result` / IDs / pipeline stages
- Event bus types + in-memory bus
- Logger / config helpers
- Core `ErrorReporter` + service registry keys
- Plugin manifest / capability contracts
- `HostContext` for capability-gated guests

## Explicitly excluded

- `@jobjitsu/ai` — do not import AI runtime from the public SDK yet
- Send execute — plugins may only request via granted caps later

Also re-exports `@jobjitsu/extension-sdk` (`createExtensionManager`, `defineExtension`).
No product extensions are bundled.

```bash
pnpm --filter @jobjitsu/sdk build
pnpm --filter @jobjitsu/sdk test
```
