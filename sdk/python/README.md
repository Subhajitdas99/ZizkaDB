# agentdb

Python SDK for [AgentDB](https://agentdb.zizka.ai) — the operational database for AI agents.

## Install

```bash
pip install agentdb
```

## Quickstart

```python
from agentdb import AgentDB

# Cloud (agentdb.zizka.ai)
db = AgentDB("agdb_live_xxxx")

# Self-hosted
db = AgentDB(host="http://localhost:8000")
```

## Log an event

```python
result = await db.log(
    agent="my-bot",
    event="tool_call",
    data={"tool": "search_web", "query": "competitor pricing"},
)
print(result.event_id)
```

## Link events causally

```python
# Log the user message
msg = await db.log(agent="my-bot", event="user_message",
                   data={"text": "why is my bill $200?"})

# Log the tool call that happened BECAUSE of the message
tool = await db.log(agent="my-bot", event="tool_call",
                    data={"tool": "get_billing"},
                    parent_id=msg.event_id)  # <-- causal link

# Log the response that happened BECAUSE of the tool call
await db.log(agent="my-bot", event="agent_response",
             data={"text": "I found an anomaly in your account"},
             parent_id=tool.event_id)
```

## Why did something happen?

```python
chain = await db.why(tool.event_id)
chain.print()
# user_message: {'text': 'why is my bill $200?'}  [14:32:01]
#     └── tool_call: {'tool': 'get_billing'}       [14:32:02]
#         └── agent_response: {'text': '...'}      [14:32:03]
```

## Semantic search

```python
results = await db.search("customer angry about billing")
for event in results:
    print(event.event, event.data)
```

## Time travel

```python
from datetime import datetime

state = await db.at("my-bot", datetime(2026, 5, 1, 15, 0))
print(state.state)
```

## Query events

```python
events = await db.query("my-bot", limit=100, event_type="tool_call")
```

## Self-host

```bash
git clone https://github.com/Zizka-ai/agentdb
cd agentdb && cp .env.example .env
docker-compose -f infra/docker-compose.yml up
```

## License

AGPL-3.0
