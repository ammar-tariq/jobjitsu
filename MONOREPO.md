# JobJitsu Monorepo

pnpm + Turborepo workspace for the AI Career Operating System.

## Requirements

- Node.js ≥ 20
- [pnpm](https://pnpm.io) 9.x (`packageManager` field pinned in root `package.json`)

## Setup

```bash
pnpm install
```

`prepare` installs Husky git hooks automatically.

## Workspace scripts

| Command                 | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `pnpm build`            | Build all packages (Turborepo)                      |
| `pnpm typecheck`        | Typecheck all packages                              |
| `pnpm test`             | Vitest per package                                  |
| `pnpm test:coverage`    | Coverage per package                                |
| `pnpm test:watch`       | Vitest workspace watch mode                         |
| `pnpm lint`             | ESLint per package (Turborepo)                      |
| `pnpm lint:root`        | ESLint entire repo                                  |
| `pnpm lint:fix`         | ESLint with autofix                                 |
| `pnpm format`           | Prettier write                                      |
| `pnpm format:check`     | Prettier check                                      |
| `pnpm check`            | format:check + lint:root + typecheck + test + build |
| `pnpm dev`              | Watch builds (parallel)                             |
| `pnpm clean`            | Remove build artifacts / node_modules               |
| `pnpm changeset`        | Add a Changeset                                     |
| `pnpm version-packages` | Apply Changesets version bumps                      |
| `pnpm release`          | Build + publish (when ready)                        |

Filter a single package:

```bash
pnpm --filter @jobjitsu/core build
pnpm --filter @jobjitsu/core test
pnpm --filter @jobjitsu/core lint
```

## Tooling

| Tool        | Config                                                 |
| ----------- | ------------------------------------------------------ |
| TypeScript  | `tsconfig.base.json`, per-package `tsconfig.json`      |
| ESLint      | `eslint.config.js` (flat)                              |
| Prettier    | `prettier.config.js`                                   |
| Vitest      | `vitest.workspace.ts` + per-package `vitest.config.ts` |
| Husky       | `.husky/pre-commit`, `.husky/commit-msg`               |
| lint-staged | root `package.json` → `lint-staged`                    |
| Commitlint  | `commitlint.config.js` (conventional)                  |
| Changesets  | `.changeset/`                                          |

### Git hooks

- **pre-commit:** lint-staged (ESLint + Prettier on staged files)
- **commit-msg:** Commitlint (Conventional Commits)

Example commit: `feat(core): add pipeline stage ids`

### Changesets

```bash
pnpm changeset
pnpm version-packages
```

See [.changeset/README.md](./.changeset/README.md).

## Structure

```
jobjitsu/
├── app/                 # Desktop shell package (@jobjitsu/app)
├── packages/            # Domain & UI libraries (@jobjitsu/*)
├── plugins/             # Official plugins (future workspace members)
├── examples/            # Fixtures / samples (future)
├── docs/                # Brand, product, architecture, backlog, ADRs
├── .changeset/
├── .husky/
├── eslint.config.js
├── prettier.config.js
├── commitlint.config.js
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

## Status

Foundation spine packages are implemented (`shared` → `testing`). Domain packages remain mostly scaffold. Desktop shell UI runs via Vite. See [docs/backlog](./docs/backlog/README.md).
