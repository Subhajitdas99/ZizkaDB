---
name: zizkadb-debug
description: Troubleshoots ZizkaDB production and local issues including 401/403 auth errors, search 400, embedding failures, and agent scope mismatches. Use when debugging ZizkaDB, production issues, search not working, or API errors.
---

# ZizkaDB Debug

## Quick diagnostics
```bash
curl -sf http://localhost:8000/health
bash scripts/smoke-test.sh
docker compose -f infra/docker-compose.yml logs api --tail 50
```

## Symptom → cause → fix

See [troubleshooting.md](troubleshooting.md) for full decision tree.

### 401 Unauthorized
- Invalid/revoked API key → create new key in Dashboard → Settings
- JWT expired → re-login via OTP
- `DEV_API_KEY` rejected → ensure `ENV=development` for local dev

### 403 Agent mismatch
- Agent-scoped key used with wrong agent name in `db.log(agent=...)`
- Fix: use matching agent name or tenant-wide key

### 400 on search / context_for
- No embedding API key → set `OPENAI_API_KEY` in env OR Dashboard → Settings → Embeddings
- Logging works without embeddings; search does not

### Event logged but not in search
- Embedding skipped — check API logs: `Embedding/index skipped`
- OpenAI down or key invalid at write time

### Empty baseline / warming_up
- Missing `session_id` on `log()` calls
- Need more sessions for drift comparison

### why() returns 404
- Wrong `event_id` or event belongs to another tenant
- Pass `event_id` from `log()` result, not agent name

## Dashboard pipeline test
```bash
# JWT dev token
curl -X POST http://localhost:8000/v1/auth/dev-token
# Use returned token:
curl -X POST http://localhost:8000/v1/auth/test-event -H "Authorization: Bearer <jwt>"
```

## Per-agent test (JWT)
```bash
curl -X POST "http://localhost:8000/v1/agents/my-bot/test-event" \
  -H "Authorization: Bearer <jwt>"
```

## Additional resources
- [troubleshooting.md](troubleshooting.md)
