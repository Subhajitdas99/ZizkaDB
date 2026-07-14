#!/usr/bin/env bash
# ZizkaDB OSS quickstart — NO git clone.
# Downloads ~4 small files to ~/.zizkadb, pulls pre-built Docker images, runs db.why() demo.
#
#   curl -fsSL https://raw.githubusercontent.com/Zizka-ai/ZizkaDB/main/scripts/quickstart-remote.sh | bash
#
set -euo pipefail

REF="${ZIZKADB_REF:-main}"
REPO="${ZIZKADB_REPO:-Zizka-ai/ZizkaDB}"
BASE="https://raw.githubusercontent.com/${REPO}/${REF}"
INSTALL_DIR="${ZIZKADB_HOME:-${HOME}/.zizkadb}"
INFRA="${INSTALL_DIR}/infra"

echo "════════════════════════════════════════════════════════"
echo "  ZizkaDB — remote quickstart (no repo clone)"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  Install dir: ${INSTALL_DIR}"
echo ""

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is required. https://docs.docker.com/get-docker/" >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker daemon not running. Start Docker Desktop or OrbStack." >&2
  exit 1
fi

mkdir -p "${INFRA}"

echo "→ Downloading compose + schema (not the full repo)..."
curl -fsSL "${BASE}/infra/docker-compose.quickstart.yml" -o "${INFRA}/docker-compose.quickstart.yml"
curl -fsSL "${BASE}/core/db/schema.sql" -o "${INFRA}/schema.sql"
curl -fsSL "${BASE}/infra/.env.quickstart" -o "${INFRA}/.env"

echo "→ Pulling pre-built images from ghcr.io/zizka-ai/..."
cd "${INFRA}"
if ! docker compose -f docker-compose.quickstart.yml pull 2>/dev/null; then
  echo ""
  echo "WARN: Could not pull pre-built images from GHCR." >&2
  echo "  Fallback — clone the repo and build locally:" >&2
  echo "    git clone https://github.com/${REPO}.git && cd ZizkaDB && bash scripts/quickstart.sh" >&2
  exit 1
fi

echo "→ Starting stack..."
docker compose -f docker-compose.quickstart.yml up -d

echo "→ Waiting for API..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "ERROR: API did not become healthy. Check: docker compose -f ${INFRA}/docker-compose.quickstart.yml logs api" >&2
    exit 1
  fi
done

if ! command -v python3 >/dev/null 2>&1; then
  echo "WARN: python3 not found — stack is up but demo skipped."
  echo "  pip install zizkadb-sdk && zizkadb demo"
  exit 0
fi

echo "→ Installing SDK from PyPI..."
python3 -m pip install -q zizkadb-sdk

echo ""
echo "→ Running causal lineage demo..."
zizkadb demo || python3 -c "
import asyncio
from zizkadb import ZizkaDB
async def main():
    async with ZizkaDB(host='http://localhost:8000') as db:
        u = await db.log(agent='support-bot', event='user_message', data={'text': 'Why was my order delayed?'})
        r = await db.log(agent='support-bot', event='llm_response', data={'model': 'gpt-4o'}, parent_id=u.event_id)
        t = await db.log(agent='support-bot', event='tool_call', data={'tool': 'lookup_order'}, parent_id=r.event_id)
        (await db.why(t.event_id)).print()
asyncio.run(main())
"

echo ""
echo "════════════════════════════════════════════════════════"
echo "  Done"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  Dashboard:  http://localhost:3001/login  →  Open my dashboard →"
echo "  API:        http://localhost:8000/health"
echo "  Connect:    https://github.com/${REPO}/blob/${REF}/CONNECT.md"
echo ""
echo "  Stop:  cd ${INFRA} && docker compose -f docker-compose.quickstart.yml down"
echo ""
