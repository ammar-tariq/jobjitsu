# `@jobjitsu/core`

Shared types, result/error model, pipeline stage IDs

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/core build
pnpm --filter @jobjitsu/core test
pnpm --filter @jobjitsu/core typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
