# ZizkaDB Local Dev Reference

## Port map
| Port | Service |
|------|---------|
| 5432 | PostgreSQL |
| 6333 | Qdrant HTTP |
| 6379 | Redis |
| 8000 | FastAPI |
| 3001 | Dashboard (Docker maps 3001→3000) |

## Common failures

### API not healthy after 60s
```bash
docker compose -f infra/docker-compose.yml logs api
docker compose -f infra/docker-compose.yml logs postgres
```

### Search returns 400
Embeddings not configured. Add `OPENAI_API_KEY` to `infra/.env` and restart api container.
Logging still works without embeddings.

### 401 on log
Use dev key: `Authorization: Bearer zizkadb_dev_local`
Or ensure `ENV=development` and `DEV_API_KEY` set in api container.

### Dashboard can't reach API
Set `NEXT_PUBLIC_API_URL=http://localhost:8000` for local npm dev.
Docker dashboard uses build-time env from compose.

### Qdrant connection refused
Wait for qdrant container: `docker compose -f infra/docker-compose.yml ps`

## SDK local usage
```python
from zizkadb import ZizkaDB
async with ZizkaDB(host="http://localhost:8000") as db:
    r = await db.log(agent="my-bot", event="test", data={"ok": True})
```

## Run pytest integration
```bash
pytest core/tests/ -m integration -v
```
