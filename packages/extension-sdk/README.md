# `@jobjitsu/extension-sdk`

Host extension contribution contracts

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/extension-sdk build
pnpm --filter @jobjitsu/extension-sdk test
pnpm --filter @jobjitsu/extension-sdk typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
