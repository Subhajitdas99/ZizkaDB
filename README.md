# ZizkaDB

The operational database for AI agents.

> Causal lineage, time-travel over logged state, semantic search, and fleet intelligence — open source, self-hostable, model-agnostic.

## Quickstart (managed cloud)

```bash
pip install zizkadb-sdk
```

> **Note:** Install `zizkadb-sdk` on PyPI. The import is `from zizkadb import ZizkaDB`.

```python
import asyncio
from zizkadb import ZizkaDB

async def main():
    async with ZizkaDB("your-api-key") as db:  # db.zizka.ai/signup
        result = await db.log(
            agent="my-bot",
            event="tool_call",
            data={"tool": "search", "query": "..."},
        )
        chain = await db.why(result.event_id)  # explicit event_id, not agent name
        chain.print()

asyncio.run(main())
```

## Self-host (open source) — one command

```bash
git clone https://github.com/Zizka-ai/ZizkaDB
cd ZizkaDB
bash scripts/setup-local.sh
```

Then:

1. Open **http://localhost:3001/login** → click **Open my dashboard →**
2. Log a test event (snippet printed by setup script)
3. Refresh dashboard — your agent appears

**Manual setup** (if you prefer):

```bash
cp .env.example infra/.env
docker compose -f infra/docker-compose.yml -f infra/docker-compose.dashboard.yml up -d
```

**SDK / MCP** (auto-uses local dev key on localhost):

```python
from zizkadb import ZizkaDB
db = ZizkaDB(host="http://localhost:8000")
```

**Production on your VPS:**

```bash
docker compose -f infra/docker-compose.yml up -d          # API stack
bash infra/deploy-selfhost.sh                             # dashboard on :3001
# Configure EMAIL_* in infra/.env for team login via OTP
```

See [docs](https://db.zizka.ai/docs) → Self-host for full guide.

> **Opt out of anonymous telemetry:** `export ZIZKADB_TELEMETRY=false`

## Managed Service

[db.zizka.ai](https://db.zizka.ai) — sign up, get API key, done.

## License

- **Core API, dashboard, Python/TypeScript SDKs:** [AGPL-3.0](LICENSE)
- **MCP server:** [MIT](mcp/LICENSE)

See [db.zizka.ai/trust](https://db.zizka.ai/trust) for architecture and technical reference.
