# `@jobjitsu/plugin-sdk`

Plugin manifest and capability contracts

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/plugin-sdk build
pnpm --filter @jobjitsu/plugin-sdk test
pnpm --filter @jobjitsu/plugin-sdk typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
