#!/usr/bin/env bash
# End-to-end workflow test — log chain, why, query, forget.
# Usage: bash scripts/test-e2e-workflow.sh [API_BASE_URL]

set -euo pipefail

BASE="${1:-http://localhost:8000}"
DEV_KEY="${DEV_API_KEY:-zizkadb_dev_local}"
AGENT="e2e-bot-$(date +%s)"
MARKER="e2e-user-$(date +%s)"

echo "→ E2E workflow @ $BASE (agent=$AGENT)"

echo "→ Health"
curl -sf "$BASE/health" | grep -q '"status":"ok"'

echo "→ Log causal chain (3 events)"
E1=$(curl -sf -X POST "$BASE/v1/events" \
  -H "Authorization: Bearer $DEV_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"agent\":\"$AGENT\",\"event\":\"user_message\",\"data\":{\"text\":\"hello\"}}")
ID1=$(echo "$E1" | python3 -c "import sys,json; print(json.load(sys.stdin)['event_id'])")

E2=$(curl -sf -X POST "$BASE/v1/events" \
  -H "Authorization: Bearer $DEV_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"agent\":\"$AGENT\",\"event\":\"llm_response\",\"data\":{\"tokens\":10},\"parent_id\":\"$ID1\"}")
ID2=$(echo "$E2" | python3 -c "import sys,json; print(json.load(sys.stdin)['event_id'])")

E3=$(curl -sf -X POST "$BASE/v1/events" \
  -H "Authorization: Bearer $DEV_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"agent\":\"$AGENT\",\"event\":\"tool_call\",\"data\":{\"tool\":\"search\",\"user_id\":\"$MARKER\"},\"parent_id\":\"$ID2\"}")
ID3=$(echo "$E3" | python3 -c "import sys,json; print(json.load(sys.stdin)['event_id'])")

echo "→ Why chain (expect 3)"
WHY=$(curl -sf -H "Authorization: Bearer $DEV_KEY" "$BASE/v1/events/$ID3/why?depth=10")
echo "$WHY" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['chain_length']==3, d"

echo "→ Query events"
curl -sf -H "Authorization: Bearer $DEV_KEY" \
  "$BASE/v1/events?agent=$AGENT&limit=5" | grep -q "$AGENT"

echo "→ List agents"
curl -sf -H "Authorization: Bearer $DEV_KEY" "$BASE/v1/agents" | grep -q "$AGENT"

echo "→ Forget by user_id"
FORGET=$(curl -sf -X DELETE "$BASE/v1/memory/forget" \
  -H "Authorization: Bearer $DEV_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"filter_key\":\"user_id\",\"filter_value\":\"$MARKER\"}")
echo "$FORGET" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['deleted_events']>=1, d"

echo "✓ E2E workflow passed"
