# `@jobjitsu/preferences`

Fit rules, approval gates, quiet hours

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/preferences build
pnpm --filter @jobjitsu/preferences test
pnpm --filter @jobjitsu/preferences typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
