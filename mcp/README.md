# zizkadb-mcp

MCP server for [ZizkaDB](https://db.zizka.ai). Gives any MCP-compatible AI agent persistent memory, semantic search, causal debugging, and time travel.

## Setup (managed cloud)

1. [Sign up](https://db.zizka.ai/signup) at db.zizka.ai  
2. **Settings → Create API key** (starts with `zizkadb_live_…`; legacy `agdb_live_…` keys still work)  
3. Paste the key into your MCP config (see below)  
4. Reload MCP in Cursor — events appear on your [dashboard](https://db.zizka.ai/dashboard) within seconds  

> **Signup alone does not log events.** You must create an API key and add it to `ZIZKADB_API_KEY`.

## Cursor — 30 second setup

Paste into `~/.cursor/mcp.json` (or `.cursor/mcp.json` in your project), then reload MCP:

```json
{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": { "ZIZKADB_API_KEY": "zizkadb_live_xxxx" }
    }
  }
}
```

Self-host: use `"ZIZKADB_HOST": "http://localhost:8000"` instead (dev key auto-injected on localhost).

## Install

```bash
pip install zizkadb-mcp
# or
uvx zizkadb-mcp
```

## Self-hosted

```json
{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": {
        "ZIZKADB_HOST": "http://localhost:8000"
      }
    }
  }
}
```

On localhost, the dev key (`zizkadb_dev_local`) is auto-injected — no API key needed for local development.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `ZIZKADB_HOST` | `https://db.zizka.ai` | API base URL |
| `ZIZKADB_API_KEY` | — | **Required on cloud.** Your key from db.zizka.ai Settings |
| `AGENTDB_API_KEY` | — | Legacy alias for `ZIZKADB_API_KEY` |
| `AGENTDB_HOST` | — | Legacy alias for `ZIZKADB_HOST` |
| `ZIZKADB_TELEMETRY` | on | Set `false` to opt out |

If `ZIZKADB_API_KEY` is missing on cloud, MCP tools return a clear error instead of silently failing.

## Links

- [Docs](https://db.zizka.ai/docs)
- [GitHub](https://github.com/Zizka-ai/ZizkaDB)
