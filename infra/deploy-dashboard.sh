#!/usr/bin/env bash
# Build and run the Next.js dashboard with PM2 on port 3001 (production default).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://db.zizka.ai}"
export NEXT_PUBLIC_DEV_MODE="${NEXT_PUBLIC_DEV_MODE:-false}"

# Docker dashboard fights for ports — do not run it in production
docker rm -f zizkadb_dashboard agentdb_dashboard 2>/dev/null || true

cd "$ROOT/dashboard"
npm ci
npm run build

if [ ! -f ecosystem.config.js ]; then
  echo "ERROR: dashboard/ecosystem.config.js missing. Pull latest code or create it before deploy." >&2
  exit 1
fi

# Reload if already running — never delete first (that causes downtime)
if pm2 describe zizkadb-dashboard >/dev/null 2>&1 || pm2 describe agentdb-dashboard >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save 2>/dev/null || true

sleep 2
pm2 list
curl -sf -o /dev/null http://127.0.0.1:3001/ && echo "Dashboard OK on :3001" || echo "Dashboard not responding on :3001"
