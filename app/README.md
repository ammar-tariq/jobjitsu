# `@jobjitsu/app`

Desktop **shell** (React webview) + **Tauri host** for JobJitsu.

Primary nav: **Applications**, **Queue**, **Follow-ups**, **Agent**, **Preferences**, **Timeline**.
**Agent** shows the startup cascade (listen-only). Other destinations stay **Coming Soon**.

## Prerequisites

| Layer         | Need                                                     |
| ------------- | -------------------------------------------------------- |
| UI / Vite     | Node 20+, pnpm (see root `pnpm bootstrap`)               |
| Native window | [Rust via rustup](https://rustup.rs) (stable) — ADR 0001 |

macOS also needs Xcode Command Line Tools (`xcode-select --install`).

## Run the native desktop window

```bash
pnpm install
pnpm --filter @jobjitsu/ui build
pnpm --filter @jobjitsu/app dev:tauri
# or from repo root:
pnpm dev:desktop
```

Opens a native window titled **JobJitsu** wrapping the React shell (Vite on `http://localhost:1420`). Status chrome shows **Agent · On-device**.

## Run the UI in a browser (no Rust)

Useful for layout work when the Rust toolchain is unavailable:

```bash
pnpm --filter @jobjitsu/app dev
# or: pnpm dev:app
```

Open **http://localhost:1420**.

```bash
pnpm --filter @jobjitsu/app build
pnpm --filter @jobjitsu/app test
```

## Layout

Material UI [dashboard template](https://github.com/mui/material-ui/tree/v9.2.0/docs/data/material/getting-started/templates/dashboard) pattern (permanent side drawer + main), themed with JobJitsu Midnight Ink / Electric Teal. No charts or SaaS cockpit chrome.

```
┌──────────────┬─────────────────────────────┐
│ JobJitsu     │  Applications               │
│──────────────│  Coming Soon                │
│ Applications │                             │
│ Queue        │  (Agent → cascade listen)   │
│ Follow-ups   │                             │
│ Agent        │                             │
│ Preferences  │                             │
│ Timeline     │                             │
│ Agent · On-  │                             │
│ device       │                             │
└──────────────┴─────────────────────────────┘
```

## Architecture notes

| Concern      | Choice                                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Native host  | Tauri 2 (ADR 0001) — `src-tauri/`                                                                                             |
| UI           | React + MUI (dashboard shell) in webview (ADR 0002) — subscribes only                                                         |
| TS↔Tauri     | Vite-first webview; host owns privileged work ([TAURI_TS_RUNTIME.md](../docs/architecture/TAURI_TS_RUNTIME.md))               |
| Host runtime | `src/host` owns AI / resume / mail fakes (process-local)                                                                      |
| Bus          | `@jobjitsu/events` — awaited async handlers                                                                                   |
| Cascade      | `App.Started → Plugin.Loaded → Resume.Generated → Email.Synced`                                                               |
| UI → AI      | **Forbidden** (`ui-ai-fence` test)                                                                                            |
| IPC          | Deny-by-default allowlist (`app/src/ipc`); `ping` + theme / `ai.getStatus` stubs ([ADR 0013](../docs/adr/0013-ipc-bridge.md)) |

See [EVENT_SYSTEM.md](../docs/architecture/EVENT_SYSTEM.md).

## Boundaries

- No career egress from the renderer; launch uses an in-memory fake mailbox only.
- Shell must not import `@jobjitsu/ai`.
- Webview capabilities are `core:default` only — no ambient filesystem/shell APIs.
- Narrow IPC allowlist in `src/ipc` — unknown commands and `ai.complete` are denied ([ADR 0013](../docs/adr/0013-ipc-bridge.md)).
