# zizkadb-sdk

Python SDK for [ZizkaDB](https://db.zizka.ai) — the operational database for AI agents.

## Setup (managed cloud)

1. [Sign up](https://db.zizka.ai/signup) at db.zizka.ai  
2. **Settings → Create API key** (`zizkadb_live_…`; legacy `agdb_live_…` still works)  
3. Pass the key to the SDK (constructor or `ZIZKADB_API_KEY` env var)  

## Install

```bash
pip install zizkadb-sdk
```

> **Note:** There is an unrelated package called `agentdb` on PyPI. Install **`zizkadb-sdk`**. Import: `from zizkadb import ZizkaDB`.

## Scaffold a project

```bash
pip install zizkadb-sdk
zizkadb init my-agent --template basic
cd my-agent && cp .env.example .env   # paste your key into ZIZKADB_API_KEY
pip install -r requirements.txt
python agent.py
```

Templates: `basic`, `openai`, `langchain`, `crewai`, `mcp-cursor`.

## Quickstart

```python
from zizkadb import ZizkaDB

# Managed cloud — paste your key from db.zizka.ai Settings
db = ZizkaDB("zizkadb_live_xxxx")

# Or use env: export ZIZKADB_API_KEY=zizkadb_live_xxxx
# db = ZizkaDB("zizkadb_live_xxxx")  # same as os.getenv("ZIZKADB_API_KEY")

# Self-hosted — auto-sends local dev key (zizkadb_dev_local)
db = ZizkaDB(host="http://localhost:8000")

async with db:
    result = await db.log(
        agent="my-bot",
        event="tool_call",
        data={"tool": "search", "query": "billing"},
    )
    chain = await db.why(result.event_id)
    chain.print()
```

Cloud host without an API key raises an error at init (no silent 401s).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `ZIZKADB_API_KEY` | Your cloud API key (preferred) |
| `AGENTDB_API_KEY` | Legacy alias for `ZIZKADB_API_KEY` |
| `ZIZKADB_HOST` | Self-hosted API URL |
| `ZIZKADB_TELEMETRY` | Set `false` to opt out |

## Self-host dashboard

1. `docker compose -f infra/docker-compose.yml up -d`
2. `NEXT_PUBLIC_API_URL=http://localhost:8000 NEXT_PUBLIC_DEV_MODE=true npm run dev` in `dashboard/`
3. Open http://localhost:3000/login → **Open my dashboard →**
4. Settings → create a named API key for production

## Telemetry opt-out

```bash
export ZIZKADB_TELEMETRY=false
```

## Links

- [Docs](https://db.zizka.ai/docs)
- [API explorer](https://db.zizka.ai/swagger)
- [GitHub](https://github.com/Zizka-ai/ZizkaDB)
