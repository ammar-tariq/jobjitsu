# Local scripts

Shell helpers for running JobJitsu on your machine. Prefer the root `pnpm` scripts (they call these).

| Script                                             | What it does                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| [`setup.sh`](./setup.sh)                           | Check Node ≥ 20, ensure pnpm, `pnpm install`, build `@jobjitsu/ui` |
| [`dev-app.sh`](./dev-app.sh)                       | Start the desktop shell (Vite) at http://localhost:1420            |
| [`dev-website.sh`](./dev-website.sh)               | Start the docs site (Docusaurus) at http://localhost:3000          |
| [`set-project-status.sh`](./set-project-status.sh) | Set GitHub Project Status (`In Progress`, `Done`, …)               |

```bash
chmod +x scripts/*.sh   # once, if needed
./scripts/setup.sh
./scripts/dev-app.sh
./scripts/dev-website.sh
./scripts/set-project-status.sh 14 "In Progress"
```

Equivalent via package.json:

```bash
pnpm bootstrap
pnpm dev:app
pnpm dev:website
pnpm project:status -- 14 "In Review"
```

### Board status

Project **JobJitsu Development** (#2). Lifecycle: **In Progress → In Review → Testing → Done** (Done on merge via Actions when `PROJECTS_TOKEN` is set).

See [AI development workflow — Branching & board status](../docs/development/AI_DEVELOPMENT_WORKFLOW.md#branching--board-status) and [`.cursor/rules/git-branching.mdc`](../.cursor/rules/git-branching.mdc).

See the root [README.md](../README.md#run-locally) for contributor run steps.
