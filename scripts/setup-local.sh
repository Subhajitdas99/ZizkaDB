#!/usr/bin/env bash
# One-command local ZizkaDB: API + dashboard with dev login enabled.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ ZizkaDB local setup"
echo ""

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is required. Install from https://docs.docker.com/get-docker/" >&2
  exit 1
fi

if [ ! -f infra/.env ]; then
  cp .env.example infra/.env
  echo "✓ Created infra/.env from .env.example"
  echo "  Tip: add OPENAI_API_KEY for semantic search (logging works without it)"
else
  echo "✓ Using existing infra/.env"
  if grep -q '^DEV_API_KEY=agdb_dev_local' infra/.env 2>/dev/null; then
    sed -i.bak 's/^DEV_API_KEY=agdb_dev_local/DEV_API_KEY=zizkadb_dev_local/' infra/.env
    rm -f infra/.env.bak
    echo "✓ Migrated DEV_API_KEY agdb_dev_local → zizkadb_dev_local"
  fi
fi

echo "→ Starting API + Postgres + Qdrant + Redis + Dashboard..."
docker compose -f infra/docker-compose.yml -f infra/docker-compose.dashboard.yml up -d --build

echo "→ Waiting for API health..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "ERROR: API did not become healthy. Check: docker compose -f infra/docker-compose.yml logs api" >&2
    exit 1
  fi
done

echo ""
echo "════════════════════════════════════════════════════════"
echo "  ZizkaDB is running locally"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  API:        http://localhost:8000/health"
echo "  Swagger:    http://localhost:8000/swagger"
echo "  Dashboard:  http://localhost:3001/login"
echo ""
echo "  Next steps:"
echo "  1. Open http://localhost:3001/login"
echo "  2. Click \"Open my dashboard →\""
echo "  3. Log a test event:"
echo ""
echo "     pip install zizkadb-sdk"
echo "     python scripts/demo-why.py    # causal chain demo (README / GIF)"
echo ""
echo "     # or one-liner log:"
echo "     python -c \""
echo "import asyncio"
echo "from zizkadb import ZizkaDB"
echo "async def main():"
echo "    async with ZizkaDB(host='http://localhost:8000') as db:"
echo "        r = await db.log(agent='my-bot', event='started', data={'ok': True})"
echo "        print('Logged:', r.event_id)"
echo "asyncio.run(main())\""
echo ""
echo "  4. Refresh dashboard — your agent appears under Agents"
echo ""
echo "  Stop:  docker compose -f infra/docker-compose.yml -f infra/docker-compose.dashboard.yml down"
echo "  Smoke: bash scripts/smoke-test.sh"
echo ""
