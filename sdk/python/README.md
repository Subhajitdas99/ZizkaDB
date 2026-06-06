# zizkadb-sdk

Python SDK for [ZizkaDB](https://db.zizka.ai) — the operational database for AI agents.

## Install

```bash
pip install zizkadb-sdk
```

> **Note:** There is an unrelated package called `agentdb` on PyPI. Install **`zizkadb-sdk`**. Import: `from zizkadb import ZizkaDB`.

## Scaffold a project

```bash
pip install zizkadb-sdk
zizkadb init my-agent --template basic
cd my-agent && cp .env.example .env && pip install -r requirements.txt
```

Templates: `basic`, `openai`, `langchain`, `crewai`, `mcp-cursor`.

## Quickstart

```python
from zizkadb import ZizkaDB

# Managed cloud (db.zizka.ai)
db = ZizkaDB("zizkadb_live_xxxx")

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
