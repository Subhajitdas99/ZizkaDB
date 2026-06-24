# ZizkaDB Integration Examples

## Generic Python (OpenAI)
From `examples/openai-agent/agent.py`:
```python
async with ZizkaDB(host="http://localhost:8000") as db:
    turn = await db.log(agent=AGENT, event="user_message", data={"text": user_input})
    response = await client.chat.completions.create(...)
    await db.log(
        agent=AGENT, event="assistant_response",
        data={"text": text}, parent_id=turn.event_id,
    )
```

## LangChain
From `integrations/langchain/zizkadb_langchain/callbacks.py`:
```python
from zizkadb import ZizkaDB
from zizkadb_langchain import ZizkaDBCallbackHandler

db = ZizkaDB("zizkadb_live_...")
handler = ZizkaDBCallbackHandler(db, agent="my-bot", session_id="sess_1")
await llm.ainvoke(messages, config={"callbacks": [handler]})
```

## CrewAI
From `integrations/crewai/zizkadb_crewai/logger.py`:
```python
from zizkadb_crewai import ZizkaDBCrewLogger

logger = ZizkaDBCrewLogger(db, agent="research-crew", session_id="sess_1")
kickoff = await logger.log_kickoff(goal="Research X")
result = crew.kickoff()
await logger.log_output(str(result), parent_id=kickoff.event_id)
```

## TypeScript
```typescript
import { ZizkaDB } from 'zizkadb-sdk'
const db = new ZizkaDB({ host: 'http://localhost:8000' })
const result = await db.log({ agent: 'node-bot', event: 'started', data: { ok: true } })
const chain = await db.why(result.eventId)
chain.print()
```

## Memory injection
```python
context = await db.context_for(
    agent="support-bot",
    task="user asking about billing",
    max_tokens=2000,
    session_id=current_session,
)
messages = [{"role": "system", "content": f"You are a support agent.\n\n{context}"}, ...]
```

## LangGraph (manual)
```python
async def research_node(state):
    evt = await db.log(
        agent="graph-bot", event="node_enter",
        data={"node": "research"},
        parent_id=state.get("last_event_id"),
        session_id=state["session_id"],
    )
    # ... node work ...
    return {**state, "last_event_id": evt.event_id}
```

## Multi-agent
- Tenant-wide key: one key, multiple `agent` names in `log()`
- Per-agent keys: `POST /v1/agents` creates scoped key per agent

## curl
```bash
curl -X POST http://localhost:8000/v1/events \
  -H "Authorization: Bearer zizkadb_dev_local" \
  -H "Content-Type: application/json" \
  -d '{"agent":"demo","event":"tool_call","data":{"tool":"search"}}'
```
