# Local scripts

Shell helpers for running JobJitsu on your machine. Prefer the root `pnpm` scripts (they call these).

| Script                               | What it does                                                       |
| ------------------------------------ | ------------------------------------------------------------------ |
| [`setup.sh`](./setup.sh)             | Check Node ≥ 20, ensure pnpm, `pnpm install`, build `@jobjitsu/ui` |
| [`dev-app.sh`](./dev-app.sh)         | Start the desktop shell (Vite) at http://localhost:1420            |
| [`dev-website.sh`](./dev-website.sh) | Start the docs site (Docusaurus) at http://localhost:3000          |

```bash
chmod +x scripts/*.sh   # once, if needed
./scripts/setup.sh
./scripts/dev-app.sh
./scripts/dev-website.sh
```

Equivalent via package.json:

```bash
pnpm setup
pnpm dev:app
pnpm dev:website
```

See the root [README.md](../README.md#run-locally) for the full contributor steps.
