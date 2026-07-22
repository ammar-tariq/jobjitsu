# `@jobjitsu/discovery`

Role discovery source interfaces and curation contracts

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/discovery build
pnpm --filter @jobjitsu/discovery test
pnpm --filter @jobjitsu/discovery typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
