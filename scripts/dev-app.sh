#!/usr/bin/env bash
# JobJitsu — run the desktop shell locally (Vite UI)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -d node_modules ]]; then
  echo "Dependencies missing. Run: pnpm setup   (or ./scripts/setup.sh)" >&2
  exit 1
fi

# Ensure UI package dist exists (workspace package consumed by the app).
if [[ ! -d packages/ui/dist ]]; then
  echo "==> Building @jobjitsu/ui…"
  pnpm --filter @jobjitsu/ui build
fi

echo "==> Desktop shell (@jobjitsu/app)"
echo "    Open http://localhost:1420 when Vite is ready."
echo "    Early foundation — Coming Soon placeholders; no full product features yet."
echo ""

exec pnpm --filter @jobjitsu/app dev
