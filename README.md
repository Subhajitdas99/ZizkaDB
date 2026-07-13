<div align="center">

# ZizkaDB

**The operational database for AI agents.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/Zizka-ai/ZizkaDB?label=release)](https://github.com/Zizka-ai/ZizkaDB/releases)
[![Python SDK](https://img.shields.io/pypi/v/zizkadb-sdk?label=PyPI%20SDK)](https://pypi.org/project/zizkadb-sdk/)
[![MCP](https://img.shields.io/pypi/v/zizkadb-mcp?label=PyPI%20MCP)](https://pypi.org/project/zizkadb-mcp/)
[![npm SDK](https://img.shields.io/npm/v/zizkadb-sdk?label=npm%20SDK)](https://www.npmjs.com/package/zizkadb-sdk)

[Documentation](https://db.zizka.ai/docs) · [Wiki](https://github.com/Zizka-ai/ZizkaDB/wiki) · [Architecture](https://db.zizka.ai/trust) · [Contributing](CONTRIBUTING.md)

</div>

When an agent misbehaves in production, you need more than scattered traces and a vector index. **ZizkaDB** is one store for **causal lineage** (`why()`), **time-travel state** (`at()`), **semantic search**, and **fleet dashboards** — open source, self-hostable, and model-agnostic.

Log every decision with `parent_id`, walk backward to the root cause in one call, and run the full stack on your machine with Docker.

<p align="center">
  <img src="docs/assets/hero-dashboard.png" alt="ZizkaDB dashboard — fleet of agents" width="100%"/>
</p>

<p align="center">
  <img src="docs/assets/gallery-why.png" alt="Causal chain from db.why()" width="23%"/>
  <a href="mcp/README.md"><img src="docs/assets/gallery-mcp.png" alt="MCP in Cursor" width="23%"/></a>
  <a href="https://github.com/Zizka-ai/ZizkaDB/wiki"><img src="docs/assets/gallery-dashboard.png" alt="Agent fleet" width="23%"/></a>
</p>

---

## Quickstart (OSS)

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) + Docker Compose v2, Python 3.10+

One command — pulls pre-built images when available (no compile), runs the lineage demo, prints dashboard link:

```bash
git clone https://github.com/Zizka-ai/ZizkaDB.git && cd ZizkaDB
bash scripts/quickstart.sh
```

| Service | URL |
|---------|-----|
| API | http://localhost:8000/health |
| Swagger | http://localhost:8000/swagger |
| Dashboard | http://localhost:3001/login → **Open my dashboard →** |

No signup. No API key on localhost. First run builds images locally if GHCR images are not published yet.

**Stack only** (no demo): `bash scripts/setup-local.sh`

---

## `why()` — your first win

The quickstart logs a support-bot session (order delay) and prints the causal chain:

<p align="center">
  <img src="docs/assets/why-demo.gif" alt="db.why() printing a causal chain" width="100%"/>
</p>

```bash
pip install zizkadb-sdk
zizkadb demo
```

Worked example with expected output: [`worked/01-support-order-delay/`](worked/01-support-order-delay/)

---

## Connect your agent

Pick your stack — Python, TypeScript, LangChain, CrewAI, MCP, or REST. All snippets use `host=http://localhost:8000` for self-host.

**[CONNECT.md](CONNECT.md)** — copy-paste connect guide

```bash
zizkadb init my-agent --template basic      # log + why()
zizkadb init my-agent --template langchain  # LangChain callbacks
zizkadb init my-agent --template crewai     # CrewAI logger
zizkadb init my-agent --template openai     # AsyncOpenAI + parent_id
zizkadb init my-agent --template mcp-cursor # Cursor MCP config
```

Framework adapters: [`integrations/`](integrations/) · runnable [`examples/`](examples/)

---

## What is ZizkaDB?

| Problem | Primitive |
|---------|-----------|
| Why did the agent do that? | `parent_id` → `why(event_id)` |
| What did it know at 2pm Tuesday? | `at(agent, timestamp)` |
| Find similar past failures | `search()` / `context_for()` |
| Is this agent drifting? | Baselines + fleet views |

**Not** a vector DB alone. **Not** traces alone. **Operational** data for agents in production.

---

## Integrate

| Path | Getting started |
|------|-----------------|
| **OSS quickstart** | `bash scripts/quickstart.sh` |
| **Connect** | [CONNECT.md](CONNECT.md) |
| **Scaffold** | `zizkadb init my-agent -t langchain` |
| Python | `pip install zizkadb-sdk` |
| LangChain | `pip install zizkadb-langchain` — [integrations/langchain](integrations/langchain) |
| CrewAI | `pip install zizkadb-crewai` — [integrations/crewai](integrations/crewai) |
| TypeScript | `npm install zizkadb-sdk` — [sdk/typescript](sdk/typescript) |
| MCP | `uvx zizkadb-mcp` — [mcp/README.md](mcp/README.md) |
| REST | OpenAPI at `/swagger` |

Self-host: `ZizkaDB(host="http://localhost:8000")` or `ZIZKADB_HOST` for MCP.

---

## Production self-host

```bash
bash infra/deploy-production.sh   # backs up Postgres first — never uses -v
```

Or API-only:

```bash
docker compose -f infra/docker-compose.yml up -d
bash infra/deploy-selfhost.sh
```

**Never** run `docker compose down -v` on a server with real users. Local dev reset only: `bash scripts/reset-local-db.sh`.

Configure `EMAIL_*` in `infra/.env` for team OTP login. Full guide: [Self-Hosting wiki](https://github.com/Zizka-ai/ZizkaDB/wiki/Self-Hosting) · [Production Deployment](https://github.com/Zizka-ai/ZizkaDB/wiki/Production-Deployment).

Pre-built OSS images: `ghcr.io/zizka-ai/zizkadb-api` and `ghcr.io/zizka-ai/zizkadb-dashboard` (published on `v*` git tags).

---

## Development

**Want to contribute?** [CONTRIBUTING.md](CONTRIBUTING.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [SECURITY.md](SECURITY.md)

### Prerequisites

- Docker + Docker Compose v2
- Python 3.10+
- Optional: Node 18+ for `dashboard/`

### Tests

Unit tests (no Docker stack):

```bash
cd core
python -m pip install -r requirements.txt -r requirements-dev.txt
python -m pytest tests -q
```

Integration tests (stack required):

```bash
bash scripts/setup-local.sh
cd core
ZIZKADB_RUN_INTEGRATION=1 python -m pytest tests -q -m integration
```

### Refresh README assets

```bash
python scripts/generate-readme-assets.py
```

Re-record terminal GIF: [docs/assets/RECORD_DEMO.md](docs/assets/RECORD_DEMO.md).

> Opt out of anonymous telemetry: `export ZIZKADB_TELEMETRY=false`

---

## Managed cloud

Prefer not to run Docker? **[db.zizka.ai](https://db.zizka.ai)** offers hosted signup, API keys (`zizkadb_live_...`), and billing. Same SDK — pass your key instead of `host=`.

---

## License

- **API, dashboard, SDKs:** [AGPL-3.0](LICENSE)
- **MCP server:** [MIT](mcp/LICENSE)
