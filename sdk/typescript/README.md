# zizkadb-sdk

TypeScript SDK for [ZizkaDB](https://db.zizka.ai) — causal lineage, time travel, and semantic search for AI agents.

## Install

```bash
npm install zizkadb-sdk
```

## Quickstart

```typescript
import { ZizkaDB } from 'zizkadb-sdk'

// Managed cloud
const db = new ZizkaDB({ apiKey: 'zizkadb_live_xxxx' })

// Self-hosted — auto-sends local dev key (zizkadb_dev_local)
const local = new ZizkaDB({ host: 'http://localhost:8000' })

const result = await local.log({
  agent: 'my-bot',
  event: 'tool_call',
  data: { tool: 'search' },
})

const chain = await local.why(result.eventId)
chain.print()
```

## Telemetry opt-out

```bash
export ZIZKADB_TELEMETRY=false
```

## Links

- [Docs](https://db.zizka.ai/docs)
- [API explorer](https://db.zizka.ai/swagger)
- [GitHub](https://github.com/Zizka-ai/ZizkaDB)
