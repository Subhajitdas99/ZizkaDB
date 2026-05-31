#!/usr/bin/env bash
# Smoke test against a running ZizkaDB stack.
# Usage: bash scripts/smoke-test.sh [API_BASE_URL]

set -euo pipefail

BASE="${1:-http://localhost:8000}"
DEV_KEY="${DEV_API_KEY:-agdb_dev_local}"

echo "→ Health"
curl -sf "$BASE/health" | grep -q '"status":"ok"'

echo "→ Dev token"
curl -sf -X POST "$BASE/v1/auth/dev-token" | grep -q 'access_token'

echo "→ Log event (dev key)"
curl -sf -X POST "$BASE/v1/events" \
  -H "Authorization: Bearer $DEV_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agent":"smoke-bot","event":"smoke","data":{"ok":true}}' \
  | grep -q 'event_id'

echo "✓ All smoke checks passed ($BASE)"
