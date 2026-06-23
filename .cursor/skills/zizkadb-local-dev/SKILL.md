---
name: zizkadb-local-dev
description: Sets up and verifies local ZizkaDB development environment with Docker Compose, smoke tests, and demo scripts. Use when running locally, setting up dev environment, Docker issues, smoke tests, or first-time project setup.
---

# ZizkaDB Local Development

## Prerequisites
- Docker + Docker Compose v2
- Python 3.10+ (for SDK/tests)
- Optional: Node 18+ (dashboard hacking)

## Setup workflow

```
- [ ] Step 1: Copy env if missing
- [ ] Step 2: Start stack
- [ ] Step 3: Verify health
- [ ] Step 4: Run smoke test
- [ ] Step 5: Optional demo
```

**Step 1:** If `infra/.env` missing: `cp .env.example infra/.env` (add `OPENAI_API_KEY` for search).

**Step 2:** Start stack:
```bash
bash scripts/setup-local.sh
```

**Step 3:** Verify:
```bash
curl -sf http://localhost:8000/health
curl -sf http://localhost:3001/ || echo "dashboard may take a moment"
```

**Step 4:** Smoke:
```bash
bash scripts/smoke-test.sh
```

**Step 5:** Demo causal chain:
```bash
pip install -e sdk/python
python scripts/demo-why.py
```

## URLs
| Service | URL |
|---------|-----|
| API health | http://localhost:8000/health |
| Swagger | http://localhost:8000/swagger |
| Dashboard | http://localhost:3001/login |

## Dev credentials
- API key: `zizkadb_dev_local` (or `DEV_API_KEY` from env)
- Dashboard: click "Open my dashboard" when `NEXT_PUBLIC_DEV_MODE=true`

## Stop / restart
```bash
docker compose -f infra/docker-compose.yml -f infra/docker-compose.dashboard.yml down
docker compose -f infra/docker-compose.yml logs api -f
```

## Common issues
See [reference.md](reference.md).

## Additional resources
- [reference.md](reference.md) — ports, failures, logs
