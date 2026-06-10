"""API key create/list/revoke — scoped to tenant and optionally to one agent."""

from __future__ import annotations

from services.auth import generate_api_key


def _key_row(row) -> dict:
    return {
        "key_id": str(row["key_id"]),
        "prefix": row["key_prefix"],
        "name": row["name"],
        "agent_id": row["agent_id"],
        "created_at": row["created_at"].isoformat(),
        "last_used": row["last_used"].isoformat() if row["last_used"] else None,
    }


async def create_api_key_record(
    pool,
    *,
    tenant_id: str,
    name: str | None,
    agent_id: str | None = None,
) -> dict:
    raw_key, key_hash, prefix = generate_api_key()
    row = await pool.fetchrow(
        """
        INSERT INTO api_keys (tenant_id, key_hash, key_prefix, name, agent_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING key_id
        """,
        tenant_id,
        key_hash,
        prefix,
        name,
        agent_id,
    )
    return {
        "key_id": str(row["key_id"]),
        "key": raw_key,
        "prefix": prefix,
        "name": name,
        "agent_id": agent_id,
        "warning": "Save this key — it will not be shown again.",
    }


async def list_api_keys_for_agent(pool, tenant_id: str, agent_id: str) -> list[dict]:
    rows = await pool.fetch(
        """
        SELECT key_id, key_prefix, name, agent_id, created_at, last_used
        FROM api_keys
        WHERE tenant_id = $1 AND agent_id = $2 AND revoked = FALSE
        ORDER BY created_at DESC
        """,
        tenant_id,
        agent_id,
    )
    return [_key_row(r) for r in rows]


async def revoke_api_key_record(pool, tenant_id: str, key_id: str, agent_id: str | None = None) -> bool:
    if agent_id:
        result = await pool.execute(
            """
            UPDATE api_keys SET revoked = TRUE
            WHERE key_id = $1::uuid AND tenant_id = $2::uuid AND agent_id = $3 AND revoked = FALSE
            """,
            key_id,
            tenant_id,
            agent_id,
        )
    else:
        result = await pool.execute(
            """
            UPDATE api_keys SET revoked = TRUE
            WHERE key_id = $1::uuid AND tenant_id = $2::uuid AND revoked = FALSE
            """,
            key_id,
            tenant_id,
        )
    return result != "UPDATE 0"
