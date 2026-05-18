#!/usr/bin/env bash
# Restart dashboard without port-3000 conflicts.
set -euo pipefail
cd "$(dirname "$0")/.."

docker rm -f zizkadb_dashboard agentdb_dashboard 2>/dev/null || true

export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://db.zizka.ai}"
docker-compose -f infra/docker-compose.yml up -d --build dashboard

sleep 2
docker ps --filter name=dashboard --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
