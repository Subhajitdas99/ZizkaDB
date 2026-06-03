# ZizkaDB

**The operational database for AI agents** — log every decision with causal links, walk backward with `why()`, time-travel state with `at()`, and search fleet memory semantically. Open source (AGPL), self-hostable, model-agnostic.

<p align="center">
  <img src="docs/assets/why-demo.gif" alt="db.why() printing a causal chain in the terminal" width="720"/>
</p>

<p align="center">
  <sub>
    Live terminal: <code>python scripts/demo-why.py</code> after <code>bash scripts/setup-local.sh</code> —
    <a href="docs/assets/RECORD_DEMO.md">re-record a cinematic GIF</a> with vhs (replaces placeholder loop)
  </sub>
</p>

**Example output** (what the GIF shows):

```
Logged chain. Walking back with db.why():

user_message: {'text': 'Why was my order delayed?'}  [14:02:01]
    └── llm_response: {'model': 'gpt-4o', 'tokens': 412}  [14:02:03]
        └── tool_call: {'tool': 'lookup_order', 'order_id': 'ORD-8842'}  [14:02:04]
```

---

## Self-host in ~30 seconds

**One command** (API + Postgres + Qdrant + Redis + dashboard):

```bash
git clone https://github.com/Zizka-ai/ZizkaDB.git && cd ZizkaDB
bash scripts/setup-local.sh
```

**Docker Compose directly** (same stack):

```bash
cp .env.example infra/.env
docker compose -f infra/docker-compose.yml -f infra/docker-compose.dashboard.yml up -d
```

| Service    | URL |
|-----------|-----|
| API       | http://localhost:8000/health |
| Swagger   | http://localhost:8000/swagger |
| Dashboard | http://localhost:3001/login → **Open my dashboard →** |

Then run the demo (no API key on localhost — dev key is auto-injected):

```bash
pip install zizkadb-sdk
python scripts/demo-why.py
```

**Production VPS:** `docker compose -f infra/docker-compose.yml up -d` then `bash infra/deploy-selfhost.sh` — see [Self-host docs](https://db.zizka.ai/docs).

> Opt out of anonymous telemetry: `export ZIZKADB_TELEMETRY=false`

---

## What is ZizkaDB?

Most agent stacks scatter **traces**, **vectors**, and **session blobs** across three tools. ZizkaDB is one **operational store** for runtime agent data:

| Problem | ZizkaDB primitive |
|--------|-------------------|
| “Why did the agent do that?” | `parent_id` on `log()` → `why(event_id)` walks root → leaf |
| “What did it know at 2pm Tuesday?” | `at(agent, timestamp)` |
| “Find similar past failures” | `search()` / `context_for()` (embeddings optional for log + why) |
| “Is this agent drifting?” | baselines + fleet views in the dashboard |

**Not** a vector DB alone. **Not** observability alone. **Operational** — the data your agent needs to run, debug, and improve in production.

---

## Quickstart (managed cloud)

```bash
pip install zizkadb-sdk
```

```python
import asyncio
from zizkadb import ZizkaDB

async def main():
    async with ZizkaDB("agdb_live_...") as db:  # https://db.zizka.ai/signup
        user = await db.log(agent="my-bot", event="user_message", data={"text": "..."})
        tool = await db.log(
            agent="my-bot", event="tool_call", data={"tool": "search"},
            parent_id=user.event_id,
        )
        (await db.why(tool.event_id)).print()

asyncio.run(main())
```

> PyPI package: `zizkadb-sdk` · import: `from zizkadb import ZizkaDB` · pass **`event_id`** to `why()`, not agent name.

---

## Integrate

| Path | Command / snippet |
|------|-------------------|
| **Python SDK** | `pip install zizkadb-sdk` |
| **TypeScript** | `npm install zizkadb` — [sdk/typescript](sdk/typescript) |
| **MCP (Cursor, Claude, …)** | `uvx zizkadb-mcp` — [mcp/README.md](mcp/README.md) |
| **REST** | OpenAPI at `/swagger` on your host |

Self-host SDK / MCP: point at `http://localhost:8000` (or your VPS); local dev key is sent automatically.

---

## Managed service

**[db.zizka.ai](https://db.zizka.ai)** — sign up, API key, dashboard, billing. Same SDK and MCP; swap host/key only.

---

## Docs & license

- **Architecture & trust:** [db.zizka.ai/trust](https://db.zizka.ai/trust)
- **Full guides:** [db.zizka.ai/docs](https://db.zizka.ai/docs)
- **Core API, dashboard, SDKs:** [AGPL-3.0](LICENSE)
- **MCP server:** [MIT](mcp/LICENSE)
