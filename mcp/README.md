# agentdb-mcp

MCP server for [AgentDB](https://agentdb.zizka.ai). Gives any MCP-compatible AI agent persistent memory, semantic search, causal debugging, and time travel — no SDK, no code changes.

Works with **Claude Desktop**, **Cursor**, **Windsurf**, **Zed**, LangChain MCP, CrewAI, AutoGen, and any framework that supports the Model Context Protocol.

## Install

```bash
pip install agentdb-mcp
```

Or run directly with `uvx` (no install needed):

```bash
uvx agentdb-mcp
```

## Quickstart

Get an API key at [agentdb.zizka.ai](https://agentdb.zizka.ai/signup), then add AgentDB to your MCP config.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agentdb": {
      "command": "uvx",
      "args": ["agentdb-mcp"],
      "env": {
        "ZIZKADB_API_KEY": "agdb_live_xxxx"
      }
    }
  }
}
```

Restart Claude Desktop. You'll see AgentDB tools appear in the tool list.

### Cursor

Edit your MCP config at `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "agentdb": {
      "command": "uvx",
      "args": ["agentdb-mcp"],
      "env": {
        "ZIZKADB_API_KEY": "agdb_live_xxxx"
      }
    }
  }
}
```

### Self-hosted AgentDB

```json
{
  "mcpServers": {
    "agentdb": {
      "command": "uvx",
      "args": ["agentdb-mcp"],
      "env": {
        "ZIZKADB_HOST": "http://localhost:8000",
        "ZIZKADB_API_KEY": ""
      }
    }
  }
}
```

## Available Tools

| Tool | What it does |
|------|-------------|
| `log_event` | Log an agent action (tool call, decision, message) with optional causal link |
| `search_memory` | Semantically search past events by meaning |
| `get_context` | Get a formatted memory block ready to paste into a system prompt |
| `why` | Trace the causal chain that led to any event |
| `query_events` | List recent events for an agent, optionally filtered by type |
| `time_travel` | Reconstruct logged agent state at a past timestamp |
| `memory_diff` | Summarise what happened in a session |
| `forget` | GDPR erasure — delete all events matching a filter |

## Example: Claude with persistent memory

Once configured, Claude can call AgentDB tools in any conversation:

> "Remember that the user prefers short replies"
> → Claude calls `log_event("assistant", "preference", {"note": "user prefers short replies", "user_id": "u_123"})`

> "What do I know about this user?"
> → Claude calls `search_memory("user preferences and history", agent="assistant")`

> "What did you tell this user last week?"
> → Claude calls `time_travel("assistant", "2026-05-03T00:00:00Z")`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ZIZKADB_HOST` | `https://agentdb.zizka.ai` | API base URL (change for self-hosted) |
| `ZIZKADB_API_KEY` | _(empty)_ | Your API key from the dashboard |

## License

MIT
