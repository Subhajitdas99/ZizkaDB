"""Churn recovery promo codes."""

from __future__ import annotations

import logging
import secrets
from datetime import datetime, timedelta, timezone

from db.connection import get_pool

log = logging.getLogger(__name__)

PROMO_PREFIX = "COMEBACK"
PROMO_VALID_DAYS = 90
REDEEM_TRIAL_DAYS = 30


def generate_promo_code() -> str:
    return f"{PROMO_PREFIX}-{secrets.token_urlsafe(8).upper().replace('_', '').replace('-', '')[:10]}"


async def create_churn_offer(email: str) -> dict:
    pool = get_pool()
    code = generate_promo_code()
    expires = datetime.now(timezone.utc) + timedelta(days=PROMO_VALID_DAYS)
    row = await pool.fetchrow(
        """
        INSERT INTO churn_offers (email, promo_code, expires_at)
        VALUES ($1, $2, $3)
        RETURNING offer_id::text, promo_code, expires_at
        """,
        email.lower().strip(),
        code,
        expires,
    )
    return {
        "offer_id": row["offer_id"],
        "promo_code": row["promo_code"],
        "expires_at": row["expires_at"].isoformat(),
    }


async def redeem_churn_promo(*, email: str, promo_code: str, user_id: str) -> bool:
    pool = get_pool()
    email = email.lower().strip()
    code = promo_code.strip().upper()
    row = await pool.fetchrow(
        """
        SELECT offer_id, expires_at, redeemed_at
        FROM churn_offers
        WHERE promo_code = $1 AND email = $2
        """,
        code,
        email,
    )
    if not row:
        return False
    if row["redeemed_at"]:
        return False
    if row["expires_at"] < datetime.now(timezone.utc):
        return False

    new_trial_end = datetime.now(timezone.utc) + timedelta(days=REDEEM_TRIAL_DAYS)
    async with pool.acquire() as conn:
        async with conn.transaction():
            updated = await conn.fetchval(
                """
                UPDATE churn_offers SET redeemed_at = NOW()
                WHERE offer_id = $1 AND redeemed_at IS NULL
                RETURNING offer_id
                """,
                row["offer_id"],
            )
            if not updated:
                return False
            await conn.execute(
                f"""
                UPDATE users
                SET trial_ends_at = NOW() + INTERVAL '{REDEEM_TRIAL_DAYS} days',
                    subscription_status = 'trialing'
                WHERE user_id = $1::uuid
                """,
                user_id,
            )
    log.info("churn promo redeemed user_id=%s", user_id)
    return True
