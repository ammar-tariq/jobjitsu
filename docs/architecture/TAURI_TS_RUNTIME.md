# Tauri ↔ TypeScript runtime (Sprint 1 note)

> Stub for Desktop Foundation. Full RFC can expand this when the native host lands.

## Decision for shell UI work

| Layer | Approach now |
|-------|----------------|
| **Shell UI** | Vite + React in `@jobjitsu/app` (`pnpm --filter @jobjitsu/app dev`) |
| **Native host** | Tauri (ADR 0001) — wrap the Vite `dist-ui` webview when Rust toolchain is available |
| **Domain** | TypeScript packages (`@jobjitsu/*`); host calls packages via a thin bridge later |
| **Renderer** | No ambient filesystem/network for career data |

## Why Vite first

Proves shell layout, tokens, and navigation without blocking on Rust/Tauri install. The webview entry (`index.html` + `src/main.tsx`) is what Tauri will load.

## Non-goals (this note)

- No AI runtime embedding.
- No Electron.
- No Node APIs in the renderer.
