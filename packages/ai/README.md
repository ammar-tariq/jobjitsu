# `@jobjitsu/ai`

Local LLM provider interfaces and context assembly contracts

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/ai build
pnpm --filter @jobjitsu/ai test
pnpm --filter @jobjitsu/ai typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
