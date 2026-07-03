"""Transactional outbox for lifecycle emails."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

from db.connection import get_pool

log = logging.getLogger(__name__)

MAX_ATTEMPTS = 5
STALE_PROCESSING_MINUTES = 10
BATCH_SIZE = 50


async def enqueue(
    *,
    campaign_id: str,
    recipient_key: str,
    to_email: str,
    payload: dict[str, Any] | None = None,
    dedupe_key: str = "default",
    scheduled_at: datetime | None = None,
) -> str | None:
    """Insert outbox row. Returns outbox_id or None if duplicate."""
    pool = get_pool()
    when = scheduled_at or datetime.now(timezone.utc)
    try:
        row = await pool.fetchrow(
            """
            INSERT INTO email_outbox (
                campaign_id, recipient_key, dedupe_key, to_email,
                payload, scheduled_at, status
            )
            VALUES ($1, $2, $3, $4, $5::jsonb, $6, 'pending')
            ON CONFLICT (campaign_id, recipient_key, dedupe_key) DO NOTHING
            RETURNING outbox_id::text
            """,
            campaign_id,
            recipient_key,
            dedupe_key,
            to_email.lower().strip(),
            json.dumps(payload or {}),
            when,
        )
        if row:
            return row[0]
        return None
    except Exception as e:
        log.warning("outbox enqueue failed campaign=%s key=%s: %s", campaign_id, recipient_key, e)
        return None


async def cancel_outbox_row(outbox_id: str, reason: str = "") -> None:
    pool = get_pool()
    await pool.execute(
        """
        UPDATE email_outbox
        SET status = 'cancelled', last_error = $2
        WHERE outbox_id = $1::uuid
        """,
        outbox_id,
        reason[:500] if reason else None,
    )


async def cancel_pending_for_user(user_id: str) -> int:
    pool = get_pool()
    result = await pool.execute(
        """
        UPDATE email_outbox
        SET status = 'cancelled'
        WHERE recipient_key = $1
          AND status = 'pending'
        """,
        user_id,
    )
    return int(result.split()[-1]) if result else 0


async def cancel_pending_for_tenant(tenant_id: str) -> int:
    pool = get_pool()
    result = await pool.execute(
        """
        UPDATE email_outbox
        SET status = 'cancelled'
        WHERE recipient_key = $1
          AND status = 'pending'
        """,
        tenant_id,
    )
    return int(result.split()[-1]) if result else 0


async def reclaim_stale_processing() -> None:
    pool = get_pool()
    await pool.execute(
        """
        UPDATE email_outbox
        SET status = 'pending'
        WHERE status = 'processing'
          AND created_at < NOW() - ($1 || ' minutes')::interval
        """,
        str(STALE_PROCESSING_MINUTES),
    )


async def claim_batch(limit: int = BATCH_SIZE) -> list[dict]:
    pool = get_pool()
    await reclaim_stale_processing()
    async with pool.acquire() as conn:
        async with conn.transaction():
            rows = await conn.fetch(
                """
                SELECT outbox_id, campaign_id, recipient_key, dedupe_key,
                       to_email, payload, attempts
                FROM email_outbox
                WHERE status = 'pending'
                  AND scheduled_at <= NOW()
                ORDER BY scheduled_at ASC
                LIMIT $1
                FOR UPDATE SKIP LOCKED
                """,
                limit,
            )
            if not rows:
                return []
            ids = [r["outbox_id"] for r in rows]
            await conn.execute(
                """
                UPDATE email_outbox
                SET status = 'processing'
                WHERE outbox_id = ANY($1::uuid[])
                """,
                ids,
            )
            return [dict(r) for r in rows]


async def mark_sent(
    outbox_id: str,
    *,
    user_id: str | None = None,
    tenant_id: str | None = None,
    provider_message_id: str | None = None,
    campaign_id: str,
    to_email: str,
    metadata: dict | None = None,
) -> None:
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                """
                UPDATE email_outbox
                SET status = 'sent', sent_at = NOW(), last_error = NULL
                WHERE outbox_id = $1::uuid
                """,
                outbox_id,
            )
            await conn.execute(
                """
                INSERT INTO email_send_log (
                    campaign_id, to_email, user_id, tenant_id,
                    provider_message_id, metadata
                )
                VALUES ($1, $2, $3::uuid, $4::uuid, $5, $6::jsonb)
                """,
                campaign_id,
                to_email,
                user_id,
                tenant_id,
                provider_message_id,
                json.dumps(metadata or {}),
            )


async def mark_failed(outbox_id: str, error: str, attempts: int) -> None:
    pool = get_pool()
    if attempts >= MAX_ATTEMPTS:
        await pool.execute(
            """
            UPDATE email_outbox
            SET status = 'failed', attempts = $2, last_error = $3
            WHERE outbox_id = $1::uuid
            """,
            outbox_id,
            attempts,
            error[:2000],
        )
        return

    backoff_min = min(30, 2 ** attempts)
    await pool.execute(
        """
        UPDATE email_outbox
        SET status = 'pending',
            attempts = $2,
            last_error = $3,
            scheduled_at = NOW() + ($4 || ' minutes')::interval
        WHERE outbox_id = $1::uuid
        """,
        outbox_id,
        attempts,
        error[:2000],
        str(backoff_min),
    )


async def outbox_stats() -> dict[str, int]:
    pool = get_pool()
    rows = await pool.fetch(
        """
        SELECT status, COUNT(*)::int AS n
        FROM email_outbox
        GROUP BY status
        """
    )
    return {r["status"]: r["n"] for r in rows}
