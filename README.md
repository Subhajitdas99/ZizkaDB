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
git clone https://github.com/Zizka-ai/Agentdb
cd Agentdb
cp .env.example infra/.env        # add OPENAI_API_KEY at minimum
docker compose -f infra/docker-compose.yml up -d
```

Then open:
- **Dashboard** → `http://localhost:3000` — event logs, causal chains, agent activity
- **API** → `http://localhost:8000` — REST API

No signup required. Your data stays on your machine.

> **Opt out of anonymous telemetry:** `export ZIZKADB_TELEMETRY=false`

## Managed Service

[db.zizka.ai](https://db.zizka.ai) — sign up, get API key, done.

## Positioning

See [db.zizka.ai/trust](https://db.zizka.ai/trust) for what ZizkaDB is and is not (claims, comparisons, compliance scope).

## License

AGPL-3.0
