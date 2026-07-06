#!/usr/bin/env bash
# One-time local dev bootstrap: venv, Python deps, dashboard npm, Qdrant binary, infra/.env
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ ZizkaDB local bootstrap"
echo ""

# Python venv
if [ ! -d .venv ]; then
  PY=""
  for candidate in python3.13 python3.12 python3; do
    if command -v "$candidate" >/dev/null 2>&1; then
      PY="$candidate"
      break
    fi
  done
  if [ -z "$PY" ]; then
    echo "ERROR: Python 3.12+ required" >&2
    exit 1
  fi
  echo "→ Creating .venv with $PY"
  "$PY" -m venv .venv
fi

echo "→ Installing Python dependencies + SDK"
.venv/bin/pip install -q -r core/requirements.txt -e sdk/python

# Dashboard deps
if [ ! -d dashboard/node_modules ]; then
  echo "→ Installing dashboard npm packages"
  (cd dashboard && npm ci)
fi

# Env file
if [ ! -f infra/.env ]; then
  cp .env.example infra/.env
  echo "✓ Created infra/.env — set OPENAI_API_KEY for semantic search"
else
  echo "✓ Using existing infra/.env"
fi

# Qdrant binary
bash scripts/download-qdrant.sh

mkdir -p .local/pids .local/logs

echo ""
echo "✓ Bootstrap complete"
echo "  Next: bash scripts/restart-native-stack.sh"
echo "  Smoke: bash scripts/smoke-test.sh"
