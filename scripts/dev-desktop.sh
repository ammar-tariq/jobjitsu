#!/usr/bin/env bash
# JobJitsu — launch the native desktop window (Tauri + Vite)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -d node_modules ]]; then
  echo "Dependencies missing. Run: pnpm bootstrap   (or ./scripts/setup.sh)" >&2
  exit 1
fi

if ! command -v rustc >/dev/null 2>&1 || ! command -v cargo >/dev/null 2>&1; then
  echo "Rust toolchain required for the desktop host (ADR 0001)." >&2
  echo "Install: https://rustup.rs  then re-run this script." >&2
  exit 1
fi

# Workspace packages are consumed from dist/ — rebuild so webview never runs stale JS
# (e.g. Node Buffer in @jobjitsu/mailbox after a source-only fix).
echo "==> Building workspace packages used by the desktop host…"
pnpm --filter @jobjitsu/ui --filter @jobjitsu/mailbox build

echo "==> Desktop host (Tauri) — window title JobJitsu"
echo "    Vite UI on http://localhost:1420; native shell wraps the webview."
echo ""

exec pnpm --filter @jobjitsu/app dev:tauri
