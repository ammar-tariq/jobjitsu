# `@jobjitsu/logger`

Local logging for JobJitsu — **no network, no cloud crash reporter**.

## Responsibility

- `Logger` / `LogSink` contracts
- `createLogger` with immutable `child()` fields
- `createConsoleLogSink` / `createMemoryLogSink`

## Depends on

Nothing (foundation sibling to events; may take `@jobjitsu/shared` later if needed).

## Rules

- Never log résumé bodies or full application drafts
- Default sinks stay on-device

```bash
pnpm --filter @jobjitsu/logger build
pnpm --filter @jobjitsu/logger test
```
