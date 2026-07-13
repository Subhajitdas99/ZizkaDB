# Getting Started

**Open source (recommended for this repo):** run ZizkaDB locally with Docker — no cloud account.

## OSS quickstart (~2 minutes)

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) + Python 3.10+

```bash
git clone https://github.com/Zizka-ai/ZizkaDB.git && cd ZizkaDB
bash scripts/quickstart.sh
```

This starts the stack (pre-built GHCR images when available), runs the **support-bot / order delay** lineage demo, and prints next steps.

| Service | URL |
|---------|-----|
| API health | http://localhost:8000/health |
| Swagger | http://localhost:8000/swagger |
| Dashboard | http://localhost:3001/login → **Open my dashboard →** |

### Run the demo again

```bash
pip install zizkadb-sdk
zizkadb demo
```

Worked example: [worked/01-support-order-delay](../worked/01-support-order-delay/)

### Connect your own agent

See **[CONNECT.md](../CONNECT.md)** — Python, TypeScript, LangChain, CrewAI, MCP, REST.

### Stack only (no demo)

```bash
bash scripts/setup-local.sh
```

---

## OSS ladder

1. **Taste lineage** — `bash scripts/quickstart.sh` or `zizkadb demo`
2. **Connect your code** — [CONNECT.md](../CONNECT.md) or `zizkadb init my-agent --template basic`
3. **Go deeper** — [examples/](../examples/), [integrations/](../integrations/)
4. **Production** — [[Self-Hosting]], [[Production Deployment]]

---

## Golden rule (self-host)

> Use the **same tenant** in SDK and dashboard.
>
> **Local dev:** login → *Open my dashboard →* + `ZizkaDB(host="http://localhost:8000")`
>
> **Production VPS:** email OTP → API key in Settings → paste into SDK/MCP

---

## Managed cloud (optional)

If you prefer hosted ZizkaDB instead of Docker:

### 1. Sign up

Go to [db.zizka.ai/signup](https://db.zizka.ai/signup) → enter email → verify OTP code.

### 2. Create an agent + API key

1. Open [Dashboard → Agents](https://db.zizka.ai/dashboard)
2. Enter an agent id (e.g. `support-bot`)
3. Click **Create**
4. **Copy the full API key** — shown once only (`zizkadb_live_...`)

### 3. Configure your environment

```bash
export ZIZKADB_API_KEY=zizkadb_live_...
export ZIZKADB_AGENT=support-bot
```

### 4. Log your first event

```bash
pip install zizkadb-sdk
```

```python
import asyncio
from zizkadb import ZizkaDB

async def main():
    async with ZizkaDB() as db:
        result = await db.log(
            agent="support-bot",
            event="connection_test",
            data={"ok": True},
        )
        print(result.event_id)

asyncio.run(main())
```

### 5. Verify in dashboard

Open your agent on the dashboard → **Events** tab.

---

## Golden rule (managed cloud)

> **The `agent` name in your code must match the agent you created in the dashboard** (unless you use a tenant-wide key — see [[Multi-Agent Apps]]).
