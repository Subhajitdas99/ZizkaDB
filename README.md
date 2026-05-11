# AgentDB

The operational database for AI agents.

> Causal lineage, time-travel, semantic search, and fleet intelligence — open source, self-hostable, model-agnostic.

## Quickstart

```bash
pip install agentdb-sdk
```

> **Important:** There is an unrelated package called `agentdb` on PyPI. Install `agentdb-sdk` — the import is still `from agentdb import AgentDB`.

```python
from agentdb import AgentDB

db = AgentDB("your-api-key")  # or host="http://localhost:8000" for self-hosted

await db.log(agent="my-bot", event="tool_call", data={"tool": "search", "query": "..."})

# Why did the agent do this?
print(await db.why("my-bot"))
```

## Self-Host

**One-click deploy (Railway):**

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/agentdb)

**Docker Compose (any VPS or local):**

```bash
git clone https://github.com/Zizka-ai/agentdb
cd agentdb
cp .env.example infra/.env        # add OPENAI_API_KEY at minimum
docker-compose -f infra/docker-compose.yml up -d
```

Then open:
- **Dashboard** → `http://localhost:3000` — event logs, causal chains, agent activity
- **API** → `http://localhost:8000` — REST API

No signup required. Your data stays on your machine.

> **Opt out of anonymous telemetry:** `export AGENTDB_TELEMETRY=false`

## Managed Service

[agentdb.zizka.ai](https://agentdb.zizka.ai) — sign up, get API key, done.

## License

AGPL-3.0
