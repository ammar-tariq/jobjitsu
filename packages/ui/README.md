# `@jobjitsu/ui`

Shared Jj* UI primitives and design tokens

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/ui build
pnpm --filter @jobjitsu/ui test
pnpm --filter @jobjitsu/ui typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
