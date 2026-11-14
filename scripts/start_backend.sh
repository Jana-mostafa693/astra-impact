#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
export PYTHONPATH="${PWD}/backend${PYTHONPATH:+:${PYTHONPATH}}"
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
