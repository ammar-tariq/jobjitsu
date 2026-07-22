#!/usr/bin/env bash
# JobJitsu — run the documentation site locally (Docusaurus)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -d node_modules ]]; then
  echo "Dependencies missing. Run: pnpm setup   (or ./scripts/setup.sh)" >&2
  exit 1
fi

echo "==> Documentation site (@jobjitsu/website)"
echo "    Reads monorepo /docs in place (no copies)."
echo "    Open http://localhost:3000 when Docusaurus is ready."
echo ""

exec pnpm --filter @jobjitsu/website dev
