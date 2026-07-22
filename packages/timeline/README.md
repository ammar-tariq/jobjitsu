# `@jobjitsu/timeline`

Local timeline and egress audit contracts

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/timeline build
pnpm --filter @jobjitsu/timeline test
pnpm --filter @jobjitsu/timeline typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
