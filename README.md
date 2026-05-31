# ZizkaDB

The operational database for AI agents.

> Causal lineage, time-travel over logged state, semantic search, and fleet intelligence — open source, self-hostable, model-agnostic.

## Quickstart

```bash
pip install zizkadb-sdk
```

> **Note:** Install `zizkadb-sdk` on PyPI. The import is `from zizkadb import ZizkaDB`.

```python
from zizkadb import ZizkaDB

db = ZizkaDB("your-api-key")  # or host="http://localhost:8000" for self-hosted

await db.log(agent="my-bot", event="tool_call", data={"tool": "search", "query": "..."})

# Why did the agent do this?
print(await db.why("my-bot"))
```

## Self-Host

**Docker Compose (any VPS or local):**

```bash
git clone https://github.com/Zizka-ai/ZizkaDB
cd ZizkaDB
cp .env.example infra/.env        # add OPENAI_API_KEY at minimum
docker compose -f infra/docker-compose.yml up -d
```

Then open:
- **API** → `http://localhost:8000` — REST API
- **Dashboard** → start separately (see below)

**SDK / MCP (no cloud account needed):**

```python
from zizkadb import ZizkaDB
db = ZizkaDB(host="http://localhost:8000")  # auto-uses local dev key
```

**Dashboard (local — one click, no email):**

```bash
cd dashboard
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 NEXT_PUBLIC_DEV_MODE=true npm run dev
# → http://localhost:3000/login → click "Open my dashboard →"
# → Settings → create API key for production use
```

**Dashboard (production self-host — email OTP, same as managed cloud):**

Configure `EMAIL_*` in `infra/.env`, then deploy with `bash infra/deploy-dashboard.sh`. Sign in at `/login` with your email.

Your data stays on your machine.

> **Opt out of anonymous telemetry:** `export ZIZKADB_TELEMETRY=false`

## Managed Service

[db.zizka.ai](https://db.zizka.ai) — sign up, get API key, done.

## Positioning

See [db.zizka.ai/trust](https://db.zizka.ai/trust) for architecture, APIs, and technical reference.

## License

AGPL-3.0
