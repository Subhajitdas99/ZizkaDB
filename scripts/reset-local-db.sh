#!/usr/bin/env bash
# LOCAL DEV ONLY — wipes Docker volumes and re-inits Postgres from schema.sql.
# Refuses to run when ENV=production (db.zizka.ai).
#
# Usage:
#   bash scripts/reset-local-db.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
source "$ROOT/infra/lib/production-guard.sh"
zizka_refuse_if_production

echo ""
echo "════════════════════════════════════════════════════════"
echo "  LOCAL DB RESET — deletes ALL local Docker data"
echo "════════════════════════════════════════════════════════"
echo "  This removes: users, tenants, events, API keys, etc."
echo "  Only use on your laptop for a fresh local install."
echo ""
echo "  NEVER run on EC2 / db.zizka.ai production."
echo ""

if [ "${LOCAL_RESET_CONFIRM:-}" != "yes" ]; then
  read -r -p "Type RESET to continue: " ans
  if [ "$ans" != "RESET" ]; then
    echo "Aborted."
    exit 1
  fi
fi

docker compose -f infra/docker-compose.yml -f infra/docker-compose.dashboard.yml down -v
bash "$ROOT/scripts/setup-local.sh"
