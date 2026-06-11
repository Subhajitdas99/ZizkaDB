# MCP and Cursor

**Package:** `zizkadb-mcp` on PyPI  
**Run:** `uvx zizkadb-mcp`

## Setup (managed cloud)

1. [Sign up](https://db.zizka.ai/signup)
2. Dashboard → **Create agent** (e.g. `cursor-agent`) → copy key
3. Add to Cursor MCP config
4. Reload MCP
5. Use the **same agent name** when logging via MCP tools

## Cursor config

`~/.cursor/mcp.json` or `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": {
        "ZIZKADB_API_KEY": "zizkadb_live_xxxx"
      }
    }
  }
}
```

## Self-hosted

```json
"env": {
  "ZIZKADB_HOST": "http://localhost:8000"
}
```

## MCP tools

| Tool | Purpose |
|------|---------|
| `log_event` | Record decision / action |
| `search_events` | Semantic search |
| `get_context_for_task` | Memory for system prompt |
| `why` | Causal chain |
| `list_events` | Recent history |
| `time_travel` | State at timestamp |

## Example prompt in Cursor

> "Log that we chose Postgres for the agent store with parent reasoning."

Agent name in tool calls must match your dashboard agent (unless using tenant-wide key).

## Install uv (for uvx)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```
