---
name: zizkadb-sdk-parity
description: Keeps ZizkaDB Python and TypeScript SDKs in sync when adding or changing client methods. Use when modifying zizkadb-sdk, adding SDK methods, Python SDK, TypeScript SDK, or npm/PyPI client changes.
---

# ZizkaDB SDK Parity

## Rule
Every public SDK method must exist in **both**:
- `sdk/python/zizkadb/client.py`
- `sdk/typescript/src/index.ts`

Types: `sdk/python/zizkadb/models.py`, `sdk/typescript/src/types.ts`

## Naming map
| Python | TypeScript | REST wire |
|--------|------------|-----------|
| `parent_id` | `parentId` | `parent_id` |
| `session_id` | `sessionId` | `session_id` |
| `event_id` | `eventId` | `event_id` |
| `context_for()` | `contextFor()` | POST `/v1/memory/context` |
| `memory_diff()` | `memoryDiff()` | GET `/v1/memory/diff/{id}` |
| `context_for_full()` | `contextForFull()` | same endpoint, full response |

## Error mapping (both SDKs)
| HTTP | Python | TypeScript |
|------|--------|------------|
| 401 | `AuthError` | `AuthError` |
| 403 | `AgentScopeError` | `AgentScopeError` |
| 404 | `NotFoundError` | `NotFoundError` |
| 429 | `RateLimitError` | (generic `ZizkaDBError`) |

## Client config parity
- Cloud default: `https://db.zizka.ai`
- Local auto-key: `zizkadb_dev_local`
- Env: `ZIZKADB_API_KEY`, legacy `AGENTDB_API_KEY`
- Telemetry: `ZIZKADB_TELEMETRY=false` to opt out

## Workflow when adding a method
1. Add to Python `client.py` with docstring + `_post`/`_get`/`_delete`
2. Add to TypeScript `index.ts` with JSDoc
3. Add types if new return shape
4. Add MCP tool if end-user primitive
5. Unit test in `core/tests/test_smoke.py` or new file
6. Update `wiki/Python-SDK.md` / `wiki/TypeScript-SDK.md` if public

## MCP
If method is exposed to IDE agents, add `@mcp.tool()` in `mcp/zizkadb_mcp/server.py` calling same REST path.
