# MCP + Cursor starter

No Python agent loop — ZizkaDB runs as MCP tools inside Cursor.

```bash
# Copy config into Cursor
cp mcp.json ~/.cursor/mcp.json
# Or merge the "zizkadb" block into your existing mcp.json
```

Reload MCP in Cursor, then try: *"Log that we chose Postgres for the agent store"*.

Tools: `log_event`, `why`, `search_memory`, `get_context`, `time_travel`, `memory_diff`, `forget`.
