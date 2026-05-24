# agentdb-sdk

TypeScript SDK for [AgentDB](https://agentdb.zizka.ai) — the database that tells you when your agent stops behaving like itself.

AgentDB watches every session, builds a behavioral baseline, and flags the ones that drift. Plus causal lineage, time travel, and semantic search over your agent's full history. Works with any agent framework or model.

## Install

```bash
npm install agentdb-sdk
```

Works in Node.js, Deno, Bun, and edge runtimes.

## Quickstart

### Cloud (managed)

```ts
import { AgentDB } from 'agentdb-sdk'

const db = new AgentDB({ apiKey: 'agdb_live_xxxx' })

const result = await db.log({
  agent: 'my-bot',
  event: 'tool_call',
  data: { tool: 'search', query: 'pricing' },
})
console.log(result.eventId)
```

### Self-hosted

```ts
const db = new AgentDB({ host: 'http://localhost:8000' })
```

## Causal lineage

```ts
const msg = await db.log({
  agent: 'my-bot', event: 'user_message',
  data: { text: 'why is my bill $200?' },
})

const tool = await db.log({
  agent: 'my-bot', event: 'tool_call',
  data: { tool: 'get_billing' },
  parentId: msg.eventId,
})

const chain = await db.why(tool.eventId)
chain.print()
// user_message: "why is my bill $200?"   [14:32:01]
//   tool_call: get_billing               [14:32:02]
```

## All methods

| Method | What it does |
| --- | --- |
| `db.log({ agent, event, data, parentId?, sessionId? })` | Log an event. Pass `parentId` to link causally. |
| `db.baseline({ agent, recentWindow? })` | Behavioral baseline + drift score for the agent. |
| `db.why(eventId)` | Causal chain back from any event to the root cause. |
| `db.search({ query, agent?, limit? })` | Semantic search across all logged events. |
| `db.at({ agent, timestamp })` | Reconstruct logged agent state at a past timestamp. |
| `db.query({ agent, limit?, eventType?, sessionId? })` | List recent events. |
| `db.contextFor({ agent, task, maxTokens? })` | Prompt-ready memory block for system prompts. |
| `db.memoryDiff(sessionId)` | Summary of what changed in a session. |
| `db.forget({ filterKey, filterValue })` | GDPR right-to-erasure. |
| `db.agents()` | List all agents in your project. |

## Telemetry

The SDK sends one anonymous ping when first instantiated: SDK name, version, runtime, OS, and whether you're in cloud or self-hosted mode. No event data, no API keys, no user identifiers. Disable with:

```bash
AGENTDB_TELEMETRY=false
```

## Links

- [Docs](https://agentdb.zizka.ai/docs)
- [API explorer](https://agentdb.zizka.ai/api-explorer)
- [GitHub](https://github.com/Zizka-ai/agentdb)

## License

AGPL-3.0
