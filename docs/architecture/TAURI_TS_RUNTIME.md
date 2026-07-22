# Tauri ↔ TypeScript runtime

> Desktop Foundation note for PE01-S01 / DF-01. Expand when IPC and host services deepen.

## Decision

| Layer | Approach |
|-------|----------|
| **Native host** | Tauri 2 under `app/src-tauri` (ADR 0001). Window title **JobJitsu**. |
| **Shell UI** | Vite + React in `@jobjitsu/app` — same entry Tauri loads in the webview |
| **Domain** | TypeScript packages (`@jobjitsu/*`); host calls them via a thin bridge later |
| **Renderer** | No ambient filesystem/network for career data; capabilities = `core:default` only |

## Commands

| Goal | Command |
|------|---------|
| Native window | `pnpm dev:desktop` or `pnpm --filter @jobjitsu/app dev:tauri` |
| Browser-only UI | `pnpm dev:app` (Vite on `:1420`) |
| Production UI bundle | `pnpm --filter @jobjitsu/app build` → `dist-ui/` |

Requires a Rust toolchain for Tauri commands ([rustup](https://rustup.rs)).

## Why this shape

- **Domain stays TypeScript** for testability (ADR 0011).
- **Privileged boundary** is the Rust host + deny-by-default IPC (ADR 0013) — not Node-in-renderer.
- Vite-first UI keeps shell work unblocked when Rust is unavailable; Tauri wraps the same `index.html` + `src/main.tsx`.

## Non-goals (this note)

- No AI runtime embedding in Rust.
- No Electron.
- No Node APIs in the renderer.
- No allowlisted career IPC commands yet — W0 surface is `ping` + theme / `ai.getStatus` stubs
  (PE01-S03). Unknown commands fail closed (ADR 0013).
