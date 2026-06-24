---
name: zizkadb-agent-integration
description: Integrates AI agents with ZizkaDB via Python SDK, TypeScript SDK, MCP, LangChain, or CrewAI. Use when integrating agents, LangChain, LangGraph, CrewAI, AutoGen, MCP, logging agent events, or wiring memory into prompts.
---

# ZizkaDB Agent Integration

## Choose integration path
| Path | When |
|------|------|
| Python SDK | Custom Python agents, FastAPI bots |
| TypeScript SDK | Node/Bun/Deno agents |
| MCP | Cursor, Claude Desktop — no app code changes |
| LangChain | LangChain/LangGraph with LangChain LLMs |
| CrewAI | CrewAI crews — manual logger |
| REST | Go, Rust, Java, any HTTP client |

## Universal pattern
1. `log()` every decision (`user_message`, `tool_call`, `assistant_response`, `error`)
2. Chain with `parent_id=previous_event_id`
3. Set `session_id` per conversation (required for baselines)
4. `context_for(agent, task)` before LLM turn for memory injection
5. `why(event_id)` on failures — use event_id, not agent name

## Quick starts
See [examples.md](examples.md) for copy-paste patterns from this repo.

## MCP setup
```json
{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": {
        "ZIZKADB_API_KEY": "zizkadb_live_xxxx",
        "ZIZKADB_HOST": "http://localhost:8000"
      }
    }
  }
}
```
Template: `.cursor/mcp.json.example`

## Scaffold new project
```bash
pip install zizkadb-sdk
zizkadb init my-agent --template basic   # or langchain, crewai, openai, mcp-cursor
```

## Not in repo (manual log only)
- LangGraph — call `db.log()` in node functions
- AutoGen — hook message handlers
- Multi-agent — distinct `agent` names or agent-scoped API keys

## Validate integration
```bash
python scripts/demo-why.py
bash scripts/test-e2e-workflow.sh
```

## Additional resources
- [examples.md](examples.md)
