from fastapi import APIRouter, Depends, Query
from api.deps import get_tenant
from db.connection import get_pool

router = APIRouter()


@router.get("")
async def list_agents(tenant: dict = Depends(get_tenant)):
    pool = get_pool()
    rows = await pool.fetch(
        """
        SELECT agent_id, first_seen, last_seen, event_count, metadata
        FROM agents
        WHERE tenant_id = $1
        ORDER BY last_seen DESC
        """,
        tenant["tenant_id"],
    )
    return [
        {
            "agent": r["agent_id"],
            "first_seen": r["first_seen"].isoformat(),
            "last_seen": r["last_seen"].isoformat(),
            "event_count": r["event_count"],
        }
        for r in rows
    ]


@router.get("/{agent_id}/stats")
async def agent_stats(agent_id: str, tenant: dict = Depends(get_tenant)):
    pool = get_pool()

    stats = await pool.fetchrow(
        """
        SELECT
            COUNT(*) AS total_events,
            COUNT(DISTINCT event_type) AS unique_event_types,
            COUNT(DISTINCT session_id) AS sessions,
            MIN(timestamp) AS first_event,
            MAX(timestamp) AS last_event
        FROM events
        WHERE tenant_id = $1 AND agent_id = $2
        """,
        tenant["tenant_id"], agent_id,
    )

    top_events = await pool.fetch(
        """
        SELECT event_type, COUNT(*) AS count
        FROM events
        WHERE tenant_id = $1 AND agent_id = $2
        GROUP BY event_type
        ORDER BY count DESC
        LIMIT 10
        """,
        tenant["tenant_id"], agent_id,
    )

    return {
        "agent": agent_id,
        "total_events": stats["total_events"],
        "unique_event_types": stats["unique_event_types"],
        "sessions": stats["sessions"],
        "first_event": stats["first_event"].isoformat() if stats["first_event"] else None,
        "last_event": stats["last_event"].isoformat() if stats["last_event"] else None,
        "top_events": [{"event": r["event_type"], "count": r["count"]} for r in top_events],
    }


@router.get("/{agent_id}/sessions")
async def list_sessions(
    agent_id: str,
    limit: int = Query(default=50, le=500),
    tenant: dict = Depends(get_tenant),
):
    pool = get_pool()
    rows = await pool.fetch(
        """
        SELECT
            session_id,
            COUNT(*)                    AS event_count,
            COUNT(DISTINCT event_type)  AS event_types,
            MIN(timestamp)              AS started_at,
            MAX(timestamp)              AS ended_at,
            EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp)))::int AS duration_seconds,
            array_agg(DISTINCT event_type ORDER BY event_type) AS types
        FROM events
        WHERE tenant_id = $1
          AND agent_id  = $2
          AND session_id IS NOT NULL
        GROUP BY session_id
        ORDER BY MAX(timestamp) DESC
        LIMIT $3
        """,
        tenant["tenant_id"], agent_id, limit,
    )
    return [
        {
            "session_id":       r["session_id"],
            "event_count":      r["event_count"],
            "event_types":      r["event_types"],
            "started_at":       r["started_at"].isoformat(),
            "ended_at":         r["ended_at"].isoformat(),
            "duration_seconds": r["duration_seconds"] or 0,
            "types":            list(r["types"]),
        }
        for r in rows
    ]
