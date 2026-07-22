# `@jobjitsu/app`

Desktop **shell** for JobJitsu — title bar, sidebar, main pane, status chrome.

This is not the product application. Every destination is a calm **Coming Soon** placeholder so we can prove layout and navigation architecture first.

## Run the shell

```bash
pnpm install
pnpm --filter @jobjitsu/ui build
pnpm --filter @jobjitsu/app dev
```

Open **http://localhost:1420** — window title **JobJitsu**, Midnight Ink dark theme.

```bash
pnpm --filter @jobjitsu/app build    # typecheck + Vite → dist-ui/
pnpm --filter @jobjitsu/app test
```

## Layout

```
┌────────────────────────────────────────────┐
│ JobJitsu                                   │
├──────────────┬─────────────────────────────┤
│ Dojo         │                             │
│ Opportunities│                             │
│ Resume       │    Welcome / Coming Soon    │
│ Inbox        │                             │
│ Recruiters   │                             │
│ Analytics    │                             │
│ Extensions   │                             │
│ Settings     │                             │
├──────────────┴─────────────────────────────┤
│                    Agent · On-device        │
└────────────────────────────────────────────┘
```

## Architecture notes

| Concern               | Choice                                                                       |
| --------------------- | ---------------------------------------------------------------------------- |
| UI                    | React (ADR 0002) in this package                                             |
| Tokens / privacy pill | `@jobjitsu/ui`                                                               |
| Desktop host          | **Tauri later** (ADR 0001) — Rust not required to develop the shell UI       |
| TS in webview         | Vite + TypeScript; domain stays in packages; no ambient Node in the renderer |
| AI                    | None in the shell                                                            |

See [TAURI_TS_RUNTIME.md](../docs/architecture/TAURI_TS_RUNTIME.md) when the native host lands.

## Boundaries

- No career egress from the renderer.
- No AI providers registered.
- Narrow IPC only when the Tauri host arrives ([ADR 0013](../docs/adr/0013-ipc-bridge.md)).
