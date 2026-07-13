#!/usr/bin/env bash
# Smoke test against a running ZizkaDB stack.
# Usage: bash scripts/smoke-test.sh [API_BASE_URL]

set -euo pipefail

BASE="${1:-http://localhost:8000}"
DEV_KEY="${DEV_API_KEY:-zizkadb_dev_local}"

echo "→ Health"
curl -sf "$BASE/health" | grep -q '"status":"ok"'

echo "→ Dev token"
curl -sf -X POST "$BASE/v1/auth/dev-token" | grep -q 'access_token'

echo "→ Log event (dev key)"
curl -sf -X POST "$BASE/v1/events" \
  -H "Authorization: Bearer $DEV_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agent":"support-bot","event":"smoke","data":{"ok":true}}' \
  | grep -q 'event_id'

# Gate 8 — semantic search (requires real OPENAI_API_KEY in infra/.env)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ -f "$ROOT/infra/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/infra/.env"
  set +a
fi

if [ "${SKIP_SEARCH:-}" = "1" ]; then
  echo "→ Semantic search skipped (SKIP_SEARCH=1)"
elif [ -z "${OPENAI_API_KEY:-}" ] || [ "$OPENAI_API_KEY" = "sk-..." ] || [ "${#OPENAI_API_KEY}" -lt 20 ]; then
  echo "→ Semantic search skipped (set OPENAI_API_KEY in infra/.env)"
else
  echo "→ Semantic search (Gate 8)"
  curl -sf -X POST "$BASE/v1/search" \
    -H "Authorization: Bearer $DEV_KEY" \
    -H "Content-Type: application/json" \
    -d '{"agent":"support-bot","query":"test","limit":1}' \
    | grep -q '"results"'
fi

echo "✓ All smoke checks passed ($BASE)"
