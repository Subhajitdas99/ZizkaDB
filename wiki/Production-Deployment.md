# Production Deployment (db.zizka.ai)

How the managed cloud instance is deployed on EC2.

## Repositories

- **ZizkaDB:** https://github.com/Zizka-ai/ZizkaDB
- API + dashboard in one repo

## Pull latest

```bash
cd ~/agentdb   # or your clone path
git pull origin main
```

## API (Python / FastAPI)

Restart your API process after pull. Migrations run on startup via `core/db/connection.py`.

```bash
# Example — adjust to your setup
pm2 restart zizkadb-api
# or
docker compose restart api
```

Verify:

```bash
curl -s https://db.zizka.ai/health
# {"status":"ok","version":"0.1.0"}
```

## Dashboard (Next.js)

**Important:** `package.json` is in `dashboard/`, not repo root.

```bash
cd ~/agentdb
bash infra/deploy-dashboard.sh
```

Manual:

```bash
cd ~/agentdb/dashboard
npm ci
rm -rf .next
npm run build
pm2 restart zizkadb-dashboard --update-env
```

Dashboard runs on port **3001** behind nginx at `db.zizka.ai`.

## Common deploy mistakes

| Mistake | Fix |
|---------|-----|
| `npm run build` from repo root | `cd dashboard` first |
| `pm2 restart` only after `.env` change | Also `npm run build` for Next.js |
| Stale `.next` folder | `rm -rf .next` before build |
| API not restarted after pull | New routes won't exist |

## Environment (production)

- `ENV=production`
- `DATABASE_URL` — Postgres
- `REDIS_URL`
- `QDRANT_URL`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- Stripe keys for billing (if enabled)
- `NEXT_PUBLIC_API_URL=https://db.zizka.ai` for dashboard build

## Verify after deploy

1. `curl https://db.zizka.ai/health` → ok
2. Login to dashboard
3. Create agent → Test agent → event appears
4. curl with API key → HTTP 201
