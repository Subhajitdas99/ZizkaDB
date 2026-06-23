# ZizkaDB — Agent Guide

**Operational database for AI agents.** Not an agent runtime.

## Quick start

```bash
bash scripts/setup-local.sh
bash scripts/smoke-test.sh
```

## Architecture

| Path | Role |
|------|------|
| `core/` | FastAPI API (Python 3.12) |
| `dashboard/` | Next.js 14 dashboard |
| `sdk/python/` | PyPI `zizkadb-sdk` |
| `sdk/typescript/` | npm `zizkadb-sdk` |
| `mcp/` | MCP server (`zizkadb-mcp`, MIT) |
| `integrations/` | LangChain + CrewAI adapters |
| `infra/` | Docker Compose, nginx, deploy scripts |

## Cursor rules

Rules in `.cursor/rules/` load automatically:

| Rule | Scope |
|------|--------|
| **`zizkadb-complete-overview.mdc`** | **Master KB — always on, full project context** |
| `zizkadb-project.mdc` | Always on — architecture, auth, pitfalls |
| `zizkadb-core-api.mdc` | `core/**` |
| `zizkadb-sdk-integrations.mdc` | `sdk/**`, `integrations/**`, `mcp/**` |
| `zizkadb-dashboard.mdc` | `dashboard/**` |
| `zizkadb-infra.mdc` | `infra/**`, `scripts/**` |
| `zizkadb-testing.mdc` | `core/tests/**`, test-related changes |

## Cursor skills

Invoke by name in chat:

| Skill | Use when |
|-------|----------|
| `zizkadb-local-dev` | Setup, Docker, smoke tests |
| `zizkadb-add-api-endpoint` | New REST routes |
| `zizkadb-sdk-parity` | Python + TypeScript SDK changes |
| `zizkadb-agent-integration` | LangChain, CrewAI, MCP, custom agents |
| `zizkadb-release` | Version bump, publish, verify-release |
| `zizkadb-debug` | 401/403, search 400, embeddings, prod issues |
| `zizkadb-testing` | Add tests, run regression, scenario catalog |

## Testing

```bash
# One-time: venv + deps (required for unit tests — SDK is not on sys.path)
cd core
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt -r requirements.txt
pip install -e ../sdk/python

# Unit only (no stack)
pytest tests/ -m "not integration" -v

# Integration (stack required)
bash scripts/setup-local.sh
pytest tests/ -m "integration and not requires_openai" -v

# Pre-push gate
bash scripts/verify-release.sh

# Full workflow
bash scripts/test-e2e-workflow.sh
```

## Key docs

- [README.md](README.md)
- [wiki/Architecture.md](wiki/Architecture.md)
- [docs/DEVELOPER_TECHNICAL_BRIEF.md](docs/DEVELOPER_TECHNICAL_BRIEF.md)
- API explorer: `/swagger` on running instance
