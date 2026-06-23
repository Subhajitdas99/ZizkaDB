# ZizkaDB Troubleshooting Guide

## Decision tree

```
API unreachable?
  → docker compose ps / logs api
  → curl :8000/health

401?
  → Key valid? Dashboard → Settings → API keys
  → DEV_API_KEY + ENV=production? Unset dev key in prod

403?
  → Agent-scoped key? Match agent= in log() to key's agent

400 search/context?
  → OPENAI_API_KEY or tenant BYOK in Settings → Embeddings
  → GET /v1/settings/embeddings (with auth) → ready: true

Log works, search empty?
  → Events logged before key was set have no vectors
  → Re-log test events after configuring embeddings

Baseline insufficient_data?
  → Add session_id to db.log() calls

Baseline warming_up?
  → Need recent_window + 1 sessions (default 51)

Forget didn't remove search hits?
  → forget matches data[key] as string JSON only
  → Qdrant delete may partial-fail — check API logs

Cross-tenant data leak suspicion?
  → Run pytest -m security: test_integration_auth.py
```

## Log locations
```bash
docker compose -f infra/docker-compose.yml logs api -f
docker compose -f infra/docker-compose.yml logs postgres
docker compose -f infra/docker-compose.yml logs qdrant
```

## Qdrant check
- Collection name: `agent_events`
- Created on API startup in `core/db/connection.py`

## Redis check
```bash
docker compose -f infra/docker-compose.yml exec redis redis-cli ping
```

## Production checklist
- [ ] ENV=production
- [ ] DEV_API_KEY unset
- [ ] JWT_SECRET rotated (not default)
- [ ] EMAIL_* configured for OTP
- [ ] OPENAI_API_KEY or tenant BYOK
- [ ] nginx routing /v1/ → api, / → dashboard

## Useful curl commands
```bash
# List agents
curl -H "Authorization: Bearer $KEY" http://localhost:8000/v1/agents

# Query events
curl -H "Authorization: Bearer $KEY" \
  "http://localhost:8000/v1/events?agent=my-bot&limit=5"

# Why chain
curl -H "Authorization: Bearer $KEY" \
  "http://localhost:8000/v1/events/$EVENT_ID/why"
```

## SDK debug
```python
import asyncio
from zizkadb import ZizkaDB

async def main():
    async with ZizkaDB(host="http://localhost:8000") as db:
        agents = await db.agents()
        print(agents)

asyncio.run(main())
```
