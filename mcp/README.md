# zizkadb-mcp

MCP server for [ZizkaDB](https://db.zizka.ai). Gives any MCP-compatible AI agent persistent memory, semantic search, causal debugging, and time travel.

## Install

```bash
pip install zizkadb-mcp
# or
uvx zizkadb-mcp
```

## Managed cloud

Get an API key at [db.zizka.ai/signup](https://db.zizka.ai/signup), then add ZizkaDB to your MCP config.

```json
{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": {
        "ZIZKADB_API_KEY": "agdb_live_xxxx"
      }
    }
  }
}
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

On localhost, the dev key (`agdb_dev_local`) is auto-injected — no API key needed for local development.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `ZIZKADB_HOST` | `https://db.zizka.ai` | API base URL |
| `ZIZKADB_API_KEY` | — | Bearer token (required for cloud) |
| `ZIZKADB_TELEMETRY` | on | Set `false` to opt out |

## Links

- [Docs](https://db.zizka.ai/docs)
- [GitHub](https://github.com/Zizka-ai/ZizkaDB)
