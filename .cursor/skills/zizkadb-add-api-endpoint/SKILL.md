---
name: zizkadb-add-api-endpoint
description: Adds new REST API endpoints to ZizkaDB FastAPI core with tenant isolation, SDK parity, and tests. Use when adding API routes, new endpoints, extending REST API, or modifying core/api handlers.
---

# Add ZizkaDB API Endpoint

## Checklist
Copy and track: [checklist.md](checklist.md)

## Default workflow

1. **Choose router** — extend existing `core/api/<area>.py` or create new + register in `core/main.py`
2. **Models** — Pydantic request/response at top of route file
3. **Auth** — `tenant: dict = Depends(get_tenant)`; `assert_agent_allowed(tenant, agent)` if agent param
4. **Logic** — reuse `write_event`, `generate_embedding`, `get_pool()`, `get_qdrant()`
5. **SQL** — always filter `tenant_id = $1`; parameterized queries only
6. **SDK** — add method to Python + TypeScript clients
7. **MCP** — add tool in `mcp/zizkadb_mcp/server.py` if user-facing
8. **Tests** — integration test in `core/tests/`
9. **Docs** — `wiki/REST-API.md`, `dashboard/app/docs/sections.tsx`

## POST write endpoint template
```python
@router.post("", status_code=201)
async def my_endpoint(body: MyRequest, tenant: dict = Depends(get_tenant)):
    assert_agent_allowed(tenant, body.agent)  # if applicable
    return await write_event(
        tenant_id=tenant["tenant_id"],
        agent=body.agent,
        event=body.event,
        data=body.data,
    )
```

## GET read endpoint template
```python
@router.get("")
async def my_query(agent: str, tenant: dict = Depends(get_tenant)):
    assert_agent_allowed(tenant, agent)
    pool = get_pool()
    rows = await pool.fetch(
        "SELECT ... FROM events WHERE tenant_id = $1 AND agent_id = $2",
        tenant["tenant_id"], agent,
    )
    return [...]
```

## Error codes
- 401 — invalid auth
- 403 — agent scope mismatch
- 404 — not found in tenant
- 400 — validation / embedding not configured

## Additional resources
- [checklist.md](checklist.md)
