# JobJitsu Monorepo

pnpm + Turborepo workspace for the AI Career Operating System.

## Requirements

- Node.js ≥ 20
- [pnpm](https://pnpm.io) 9.x (`packageManager` field pinned in root `package.json`)

## Setup

```bash
pnpm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages via Turborepo |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run Vitest in each package |
| `pnpm test:coverage` | Coverage per package |
| `pnpm dev` | Watch mode (parallel) |
| `pnpm clean` | Remove build artifacts |

Filter a single package:

```bash
pnpm --filter @jobjitsu/core build
pnpm --filter @jobjitsu/core test
```

## Structure

```
jobjitsu/
├── app/                 # Desktop shell package (@jobjitsu/app)
├── packages/            # Domain & UI libraries (@jobjitsu/*)
├── plugins/             # Official plugins (future workspace members)
├── examples/            # Fixtures / samples (future)
├── docs/                # Brand, product, architecture, backlog, ADRs
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── vitest.workspace.ts
```

See [packages/README.md](./packages/README.md) and [docs/architecture/MONOREPO.md](./docs/architecture/MONOREPO.md).

## Package boundaries

- `@jobjitsu/agent` **must not** depend on `@jobjitsu/send`
- Career data egress only through `@jobjitsu/send`
- Domain packages must not depend on `@jobjitsu/app`

## Testing

Vitest is configured per package (`vitest.config.ts`) and aggregated via `vitest.workspace.ts`.

```bash
pnpm test
# or
pnpm exec vitest run --workspace vitest.workspace.ts
```

Privacy / sovereignty must-pass suites arrive with backlog QA tasks — scaffolding includes smoke identity tests only.

## Status

**Scaffold only** — no business logic. Implementation follows [docs/backlog](./docs/backlog/README.md).
