# zizkadb-sdk

TypeScript SDK for [ZizkaDB](https://db.zizka.ai) — causal lineage, time travel, and semantic search for AI agents.

## Setup (managed cloud)

1. [Sign up](https://db.zizka.ai/signup) at db.zizka.ai  
2. **Settings → Create API key** (`zizkadb_live_…`; legacy `agdb_live_…` still works)  
3. Pass the key to the SDK (constructor or `ZIZKADB_API_KEY` env var)  

## Install

```bash
npm install zizkadb-sdk
```

## Quickstart

```typescript
import { ZizkaDB } from 'zizkadb-sdk'

// Managed cloud — paste your key from db.zizka.ai Settings
const db = new ZizkaDB({ apiKey: 'zizkadb_live_xxxx' })

// Or: new ZizkaDB({ apiKey: process.env.ZIZKADB_API_KEY! })

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

Cloud host without an API key raises an error at init (no silent 401s).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `ZIZKADB_API_KEY` | Your cloud API key (preferred) |
| `AGENTDB_API_KEY` | Legacy alias for `ZIZKADB_API_KEY` |
| `ZIZKADB_HOST` | Self-hosted API URL |
| `ZIZKADB_TELEMETRY` | Set `false` to opt out |

## Telemetry opt-out

```bash
export ZIZKADB_TELEMETRY=false
```

## Links

- [Docs](https://db.zizka.ai/docs)
- [API explorer](https://db.zizka.ai/swagger)
- [GitHub](https://github.com/Zizka-ai/ZizkaDB)
