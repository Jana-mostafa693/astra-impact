#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
command -v pnpm >/dev/null || { echo 'Install pnpm10.18.0 using: npm install -g pnpm@10.18.0' >&2; exit 1; }
cd frontend
pnpm install --frozen-lockfile
echo 'Setup complete. Run: bash scripts/start_dev.sh from the project root.'
