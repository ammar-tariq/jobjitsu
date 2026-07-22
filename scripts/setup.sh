#!/usr/bin/env bash
# JobJitsu — one-time (or refresh) local setup
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> JobJitsu setup"
echo "    Root: $ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required (v20+)." >&2
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  echo "Error: Node.js >= 20 required (found $(node -v))." >&2
  exit 1
fi
echo "    Node: $(node -v)"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "    pnpm not found — enabling via corepack…"
  corepack enable
  corepack prepare pnpm@9.15.0 --activate
fi
echo "    pnpm: $(pnpm -v)"

echo "==> Installing workspace dependencies"
pnpm install

echo "==> Building shared UI package (needed by the desktop shell)"
pnpm --filter @jobjitsu/ui build

echo ""
echo "Setup complete. Next:"
echo "  pnpm dev:app       # desktop shell → http://localhost:1420"
echo "  pnpm dev:website   # docs site    → http://localhost:3000"
echo "  pnpm check         # format + lint + typecheck + test + build"
echo ""
echo "Or: ./scripts/dev-app.sh  |  ./scripts/dev-website.sh"
