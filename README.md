# AgentDB

The operational database for AI agents.

> Causal lineage, time-travel, semantic search, and fleet intelligence — open source, self-hostable, model-agnostic.

## Quickstart

```bash
pip install agentdb
```

```python
from agentdb import AgentDB

db = AgentDB("your-api-key")  # or host="http://localhost:8000" for self-hosted

await db.log(agent="my-bot", event="tool_call", data={"tool": "search", "query": "..."})

# Why did the agent do this?
print(await db.why("my-bot"))
```

## Self-Host

```bash
git clone https://github.com/Zizka-ai/agentdb
cd agentdb
cp .env.example .env
docker-compose up
```

## Managed Service

[agentdb.zizka.ai](https://agentdb.zizka.ai) — sign up, get API key, done.

## License

AGPL-3.0
