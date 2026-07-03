"""Campaign eligibility checks before send."""

from __future__ import annotations

from db.connection import get_pool
from services.email.config import TEST_AGENT_ID

_REAL_EVENT_FILTER = """
    AND NOT (agent_id = $2 AND event_type = 'connection_test')
"""


async def user_exists(user_id: str) -> bool:
    pool = get_pool()
    row = await pool.fetchval(
        "SELECT 1 FROM users WHERE user_id = $1::uuid",
        user_id,
    )
    return row is not None


async def count_active_keys(tenant_id: str) -> int:
    pool = get_pool()
    return int(
        await pool.fetchval(
            """
            SELECT COUNT(*) FROM api_keys
            WHERE tenant_id = $1::uuid AND revoked = FALSE
            """,
            tenant_id,
        )
        or 0
    )


async def has_real_events(tenant_id: str) -> bool:
    pool = get_pool()
    row = await pool.fetchval(
        f"""
        SELECT 1 FROM events
        WHERE tenant_id = $1::uuid
        {_REAL_EVENT_FILTER}
        LIMIT 1
        """,
        tenant_id,
        TEST_AGENT_ID,
    )
    return row is not None


async def events_in_last_days(tenant_id: str, days: int) -> bool:
    pool = get_pool()
    row = await pool.fetchval(
        f"""
        SELECT 1 FROM events
        WHERE tenant_id = $1::uuid
          AND timestamp > NOW() - ($3 || ' days')::interval
        {_REAL_EVENT_FILTER}
        LIMIT 1
        """,
        tenant_id,
        TEST_AGENT_ID,
        str(days),
    )
    return row is not None


async def eligible_no_api_72h(*, user_id: str, tenant_id: str) -> bool:
    if not await user_exists(user_id):
        return False
    return await count_active_keys(tenant_id) == 0


async def eligible_api_no_events(*, tenant_id: str) -> bool:
    if await count_active_keys(tenant_id) == 0:
        return False
    return not await has_real_events(tenant_id)


async def eligible_inactive_7d(*, tenant_id: str) -> bool:
    if await count_active_keys(tenant_id) == 0:
        return False
    if not await has_real_events(tenant_id):
        return False
    return not await events_in_last_days(tenant_id, 7)


async def eligible_active_checkin(*, user_id: str, tenant_id: str) -> bool:
    if not await user_exists(user_id):
        return False
    if not await events_in_last_days(tenant_id, 7):
        return False
    pool = get_pool()
    row = await pool.fetchval(
        """
        SELECT 1 FROM email_send_log
        WHERE user_id = $1::uuid
          AND campaign_id = 'active_checkin'
          AND sent_at > NOW() - INTERVAL '15 days'
        LIMIT 1
        """,
        user_id,
    )
    return row is None


async def eligible_welcome(*, user_id: str) -> bool:
    return await user_exists(user_id)


async def user_has_marketing_consent(user_id: str) -> bool:
    pool = get_pool()
    row = await pool.fetchval(
        "SELECT marketing_consent FROM users WHERE user_id = $1::uuid",
        user_id,
    )
    return bool(row)


async def eligible_marketing_send(*, user_id: str | None, campaign_id: str) -> bool:
    """Marketing-category sends require consent (newsletter welcome is explicit opt-in)."""
    if campaign_id == "newsletter_welcome":
        return True
    if not user_id:
        return False
    return await user_has_marketing_consent(user_id)


ELIGIBILITY_HANDLERS = {
    "welcome": lambda p: eligible_welcome(user_id=p["user_id"]),
    "getting_started": lambda p: eligible_welcome(user_id=p["user_id"]),
    "no_api_72h": lambda p: eligible_no_api_72h(
        user_id=p["user_id"], tenant_id=p["tenant_id"]
    ),
    "api_no_events": lambda p: eligible_api_no_events(tenant_id=p["tenant_id"]),
    "inactive_7d": lambda p: eligible_inactive_7d(tenant_id=p["tenant_id"]),
    "active_checkin": lambda p: eligible_active_checkin(
        user_id=p["user_id"], tenant_id=p["tenant_id"]
    ),
    "account_deleted": lambda p: True,
    "newsletter_welcome": lambda p: True,
}


async def check_eligibility(campaign_id: str, payload: dict) -> bool:
    handler = ELIGIBILITY_HANDLERS.get(campaign_id)
    if not handler:
        return True
    return await handler(payload)
