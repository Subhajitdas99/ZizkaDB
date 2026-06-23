# API Endpoint Checklist

```
- [ ] Pydantic request/response models in core/api/<area>.py
- [ ] Depends(get_tenant) on authenticated routes
- [ ] assert_agent_allowed(tenant, agent_id) where agent param exists
- [ ] tenant_id in every SQL WHERE clause
- [ ] Reuse write_event / generate_embedding — no duplicate INSERT
- [ ] Register router in core/main.py if new file
- [ ] OpenAPI valid at /swagger
- [ ] Python SDK: sdk/python/zizkadb/client.py
- [ ] TypeScript SDK: sdk/typescript/src/index.ts (+ types.ts)
- [ ] MCP tool: mcp/zizkadb_mcp/server.py (if user-facing)
- [ ] wiki/REST-API.md updated
- [ ] dashboard/app/docs/sections.tsx updated
- [ ] Integration test in core/tests/
- [ ] Scenario ID added to zizkadb-testing/scenario-catalog.md (if new behavior)
```
