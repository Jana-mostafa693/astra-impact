#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PYTHON="${PYTHON:-python3}"
if [[ -x "$ROOT/.venv/bin/python" ]]; then PYTHON="$ROOT/.venv/bin/python"; fi
command -v pnpm >/dev/null || { echo 'Install pnpm10.18.0 (npm install -g pnpm@10.18.0) first.' >&2; exit 1; }
[[ -d frontend/node_modules ]] || { echo 'Run scripts/setup.sh first.' >&2; exit 1; }
export PYTHONPATH="$ROOT/backend"
"$PYTHON" -m uvicorn app.main:app --host 127.0.0.1 --port "${API_PORT:-8000}" &
API_PID=$!
trap 'kill "$API_PID" 2>/dev/null || true' EXIT INT TERM
cd frontend
API_PROXY_TARGET="http://127.0.0.1:${API_PORT:-8000}" pnpm dev
