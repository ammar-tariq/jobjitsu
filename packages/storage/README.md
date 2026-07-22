# `@jobjitsu/storage`

On-device persistence adapters (documents, blobs)

## Status

Scaffold only — **no business logic** yet. See [docs/architecture](../../docs/architecture/OVERVIEW.md) and [docs/backlog](../../docs/backlog/README.md).

## Scripts

```bash
pnpm --filter @jobjitsu/storage build
pnpm --filter @jobjitsu/storage test
pnpm --filter @jobjitsu/storage typecheck
```

## Boundaries

Follow [package boundaries](../../docs/architecture/PACKAGE_BOUNDARIES.md). `agent` must never depend on `send`.
