# `@jobjitsu/app`

Desktop **shell** (React webview) + **Tauri host** for JobJitsu.

Primary nav: **Craft**, **Applications**, **Queue**, **Follow-ups**, **Profile**, **Agent**, **Preferences**, **Timeline**.
**Profile** holds identity and career Paths. **Preferences** covers data folder, approval-before-send, writing voice, and on-device Agent model.
**Agent** shows readiness and recent activity (listen-only). Queue / Follow-ups / Timeline are thin local views — never auto-send.

Sellable local MVP notes: [SELLABLE_LOCAL_MVP.md](../docs/product/SELLABLE_LOCAL_MVP.md).

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

Opens a native window titled **JobJitsu** wrapping the React shell (Vite on `http://localhost:1420`). Status chrome starts as **Agent · Unavailable**, then **Agent · On-device** when the local Agent path is ready (never “Local LLM”; remote ready is **Agent · Ready**).

## Run the UI in a browser (no Rust)

Useful for layout work when the Rust toolchain is unavailable:

```bash
pnpm --filter @jobjitsu/app dev
# or: pnpm dev:app
```

Open **http://localhost:1420**. Browser mode uses session memory; Tauri uses the durable data folder.

```bash
pnpm --filter @jobjitsu/app build
pnpm --filter @jobjitsu/app test
```

## Layout

Material UI dashboard pattern (permanent side drawer + main), themed with JobJitsu **Midnight Ink** (dark default) and Soft Cloud light. Toggle appearance under **Preferences** — stored on this device. No charts or SaaS cockpit chrome.

```
┌──────────────┬─────────────────────────────┐
│ JobJitsu     │  Craft / Applications / …   │
│──────────────│                             │
│ Craft        │  One job per view           │
│ Applications │                             │
│ Queue        │  Agent · On-device           │
│ Follow-ups   │                             │
│ Profile      │                             │
│ Agent        │        Main content         │
│ Preferences  │                             │
│ Timeline     │                             │
└──────────────┴─────────────────────────────┘
```

## Architecture notes

| Concern      | Choice                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Native host  | Tauri 2 (ADR 0001) — `src-tauri/`                                                                                          |
| UI           | React + MUI (dashboard shell) in webview (ADR 0002) — subscribes only                                                      |
| TS↔Tauri     | Vite-first webview; host owns privileged work ([TAURI_TS_RUNTIME.md](../docs/architecture/TAURI_TS_RUNTIME.md))            |
| Host runtime | `src/host` owns AI / identity / durable stores                                                                             |
| Bus          | `@jobjitsu/events` — awaited async handlers                                                                                |
| Startup      | `App.Started → Plugin.Loaded → Ai.LocalModelReady` (no outbound send)                                                      |
| UI → AI      | **Forbidden** (`ui-ai-fence` test)                                                                                         |
| IPC          | Deny-by-default allowlist (`app/src/ipc`); career egress intentionally absent ([ADR 0013](../docs/adr/0013-ipc-bridge.md)) |

See [EVENT_SYSTEM.md](../docs/architecture/EVENT_SYSTEM.md).

## Boundaries

- No career egress from the renderer; startup never sends mail.
- Shell must not import `@jobjitsu/ai`.
- Webview capabilities stay deny-by-default: dialog open + scoped FS for the on-device data folder, plus `allow_data_directory` for custom folders — no shell/HTTP career egress.
- Narrow IPC allowlist in `src/ipc` — unknown commands and `ai.complete` are denied ([ADR 0013](../docs/adr/0013-ipc-bridge.md)).
