"""Sync newsletter subscriber state when a user signs up."""

from __future__ import annotations

import logging

from db.connection import get_pool

log = logging.getLogger(__name__)


async def sync_newsletter_on_signup(
    *,
    email: str,
    marketing_consent: bool,
) -> None:
    """Link popup subscriber to signup consent.

    If the user declined marketing at signup, unsubscribe any existing
    newsletter row for this email. If they opted in, reactivate a prior row.
    """
    pool = get_pool()
    email = email.lower().strip()
    row = await pool.fetchrow(
        """
        SELECT subscriber_id, unsubscribed_at
        FROM newsletter_subscribers
        WHERE email = $1
        """,
        email,
    )
    if not row:
        return

    if marketing_consent:
        if row["unsubscribed_at"] is not None:
            await pool.execute(
                """
                UPDATE newsletter_subscribers
                SET unsubscribed_at = NULL, subscribed_at = NOW()
                WHERE email = $1
                """,
                email,
            )
        return

    if row["unsubscribed_at"] is None:
        await pool.execute(
            """
            UPDATE newsletter_subscribers
            SET unsubscribed_at = NOW()
            WHERE email = $1
            """,
            email,
        )
        log.info("newsletter unsubscribed on signup (marketing_consent=false): %s", email)
