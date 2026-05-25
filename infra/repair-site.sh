#!/usr/bin/env bash
# Fix blank db.zizka.ai (stale .next / PM2 serving old HTML vs missing JS chunks).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

if [ "${SKIP_GIT_PULL:-}" != "1" ]; then
  echo "==> Pull latest (set SKIP_GIT_PULL=1 to skip)"
  if ! git pull origin main; then
    echo "WARN: git pull failed — continuing with current tree ($(git rev-parse --short HEAD 2>/dev/null || echo unknown))" >&2
  fi
fi

echo "==> Rebuild dashboard (clean .next)"
bash "$ROOT/infra/deploy-dashboard.sh"

echo "==> API containers (optional — skip if only frontend was broken)"
if [ -f "$ROOT/infra/docker-compose.yml" ]; then
  (cd "$ROOT/infra" && docker compose ps -q api 2>/dev/null | grep -q . && docker compose up -d api) || true
fi

echo "==> Public check"
WEBPACK=$(ls "$ROOT/dashboard/.next/static/chunks/webpack-"*.js 2>/dev/null | head -1)
CHUNK=$(basename "$WEBPACK")
CODE=$(curl -sS -o /dev/null -w "%{http_code}" "https://db.zizka.ai/_next/static/chunks/${CHUNK}" || echo "000")
echo "https://db.zizka.ai/_next/static/chunks/${CHUNK} → HTTP ${CODE}"
if [ "$CODE" = "200" ]; then
  echo "Site repair OK. Hard-refresh browser (Cmd+Shift+R)."
else
  echo "Still broken — check: pm2 logs zizkadb-dashboard, nginx -t, port 3001" >&2
  exit 1
fi
