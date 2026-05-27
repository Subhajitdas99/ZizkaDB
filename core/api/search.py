from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any

from api.deps import get_tenant
from db.connection import get_pool, get_qdrant
from services.embeddings import generate_embedding

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    agent: str | None = None
    limit: int = 10


@router.post("")
async def semantic_search(
    body: SearchRequest,
    tenant: dict = Depends(get_tenant),
):
    tenant_id = tenant["tenant_id"]

    embedding = await generate_embedding(body.query, tenant_id)
    if not embedding:
        raise HTTPException(
            status_code=400,
            detail=(
                "Embedding generation failed. Configure embeddings in Dashboard → Settings "
                "(platform key or your OpenAI API key)."
            ),
        )

    qdrant = get_qdrant()

    query_filter = None
    if body.agent:
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        query_filter = Filter(
            must=[
                FieldCondition(key="tenant_id", match=MatchValue(value=tenant_id)),
                FieldCondition(key="agent_id", match=MatchValue(value=body.agent)),
            ]
        )
    else:
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        query_filter = Filter(
            must=[FieldCondition(key="tenant_id", match=MatchValue(value=tenant_id))]
        )

    results = await qdrant.search(
        collection_name="agent_events",
        query_vector=embedding,
        query_filter=query_filter,
        limit=body.limit,
        with_payload=True,
    )

    # Fetch full events from Postgres
    pool = get_pool()
    import json

    event_ids = [r.id for r in results]
    if not event_ids:
        return {"results": []}

    rows = await pool.fetch(
        """
        SELECT event_id, agent_id, timestamp, event_type,
               data, parent_event_id, session_id, sequence_no
        FROM events
        WHERE event_id = ANY($1::uuid[]) AND tenant_id = $2
        """,
        event_ids, tenant_id,
    )

    score_map = {r.id: r.score for r in results}
    events = []
    for row in rows:
        data = row["data"]
        if isinstance(data, str):
            data = json.loads(data)
        events.append({
            "event_id": str(row["event_id"]),
            "agent": row["agent_id"],
            "timestamp": row["timestamp"].isoformat(),
            "event": row["event_type"],
            "data": dict(data),
            "parent_id": str(row["parent_event_id"]) if row["parent_event_id"] else None,
            "score": score_map.get(str(row["event_id"]), 0),
        })

    events.sort(key=lambda x: x["score"], reverse=True)
    return {"query": body.query, "results": events}
