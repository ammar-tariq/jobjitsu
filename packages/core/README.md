# `@jobjitsu/core`

Platform **kernel** — sits above shared / events / logger / config.

## Responsibility

- Re-exports `@jobjitsu/shared` (`Result`, IDs, pipeline stages)
- Re-exports logger contracts for existing imports
- `createErrorReporter` — local only
- `createServiceRegistry` + `FoundationKeys` — composition root helpers (**no AI**)

## Depends on

`shared` → `events` → `logger` → `config` (siblings wired here)

```bash
pnpm --filter @jobjitsu/core build
pnpm --filter @jobjitsu/core test
```
