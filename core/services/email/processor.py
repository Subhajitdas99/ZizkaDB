"""Process outbox rows and scheduled campaign scans."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from db.connection import get_pool
from services.email.config import (
    CALENDLY_URL,
    FOUNDER_EMAIL,
    active_checkin_dedupe_key,
    dashboard_url,
    docs_url,
    lifecycle_enabled,
)
from services.email.outbox import cancel_outbox_row, claim_batch, mark_failed, mark_sent
from services.email.eligibility import check_eligibility, eligible_marketing_send
from services.email.service import get_email_service

log = logging.getLogger(__name__)


async def build_context(campaign_id: str, payload: dict, to_email: str) -> dict:
    ctx = dict(payload)
    ctx.setdefault("dashboard_url", dashboard_url())
    ctx.setdefault("docs_url", docs_url())
    ctx.setdefault("calendly_url", CALENDLY_URL)
    ctx.setdefault("founder_email", FOUNDER_EMAIL)

    user_id = payload.get("user_id")
    if user_id and campaign_id in ("welcome", "getting_started", "no_api_72h"):
        pool = get_pool()
        row = await pool.fetchrow(
            """
            SELECT plan, trial_ends_at FROM users WHERE user_id = $1::uuid
            """,
            user_id,
        )
        if row:
            plan = row["plan"] or "pro"
            ctx["plan_name"] = plan.capitalize()
            if row["trial_ends_at"]:
                ctx["trial_ends_at"] = row["trial_ends_at"].strftime("%B %d, %Y")
        else:
            ctx["plan_name"] = "Pro"
    if campaign_id == "no_api_72h":
        ctx.setdefault("days_ago", "3")

    return ctx


async def process_outbox_batch() -> int:
    if not lifecycle_enabled():
        return 0

    rows = await claim_batch()
    if not rows:
        return 0

    svc = get_email_service()
    processed = 0

    for row in rows:
        outbox_id = str(row["outbox_id"])
        campaign_id = row["campaign_id"]
        attempts = int(row["attempts"] or 0) + 1
        payload = row["payload"]
        if isinstance(payload, str):
            payload = json.loads(payload)
        to_email = row["to_email"]

        try:
            if campaign_id not in ("account_deleted", "newsletter_welcome"):
                if not await check_eligibility(campaign_id, payload):
                    await cancel_outbox_row(outbox_id, "eligibility not met")
                    continue

            context = await build_context(campaign_id, payload, to_email)
            cfg_reply = None
            from services.email.config import get_campaign

            camp = get_campaign(campaign_id)
            if camp:
                cfg_reply = camp.reply_to
                if camp.category == "marketing":
                    if not await eligible_marketing_send(
                        user_id=payload.get("user_id"),
                        campaign_id=campaign_id,
                    ):
                        await cancel_outbox_row(outbox_id, "marketing consent not given")
                        continue

            result = await svc.send_template(
                campaign_id=campaign_id,
                to_email=to_email,
                context=context,
                reply_to=cfg_reply,
            )
            if result == "skipped":
                await cancel_outbox_row(outbox_id, "recipient not allowed or campaign disabled")
                continue

            await mark_sent(
                outbox_id,
                user_id=payload.get("user_id"),
                tenant_id=payload.get("tenant_id"),
                campaign_id=campaign_id,
                to_email=to_email,
            )
            processed += 1
        except Exception as e:
            log.warning(
                "outbox send failed id=%s campaign=%s: %s",
                outbox_id,
                campaign_id,
                e,
            )
            await mark_failed(outbox_id, str(e), attempts)

    return processed


async def scan_scheduled_campaigns() -> int:
    """Daily-style scans for C5 inactive and C6 active check-in."""
    if not lifecycle_enabled():
        return 0

    from services.email.outbox import enqueue

    pool = get_pool()
    enqueued = 0

    inactive_rows = await pool.fetch(
        """
        SELECT u.user_id::text, u.email, u.tenant_id::text
        FROM users u
        WHERE u.tenant_id IS NOT NULL
          AND u.subscription_status IN ('trialing', 'active', 'past_due')
          AND EXISTS (
              SELECT 1 FROM api_keys ak
              WHERE ak.tenant_id = u.tenant_id AND ak.revoked = FALSE
          )
          AND EXISTS (
              SELECT 1 FROM events e
              WHERE e.tenant_id = u.tenant_id
                AND NOT (e.agent_id = $1 AND e.event_type = 'connection_test')
          )
          AND NOT EXISTS (
              SELECT 1 FROM events e
              WHERE e.tenant_id = u.tenant_id
                AND e.timestamp > NOW() - INTERVAL '7 days'
                AND NOT (e.agent_id = $1 AND e.event_type = 'connection_test')
          )
        LIMIT 200
        """,
        "dashboard-connection-test",
    )
    week_key = datetime.now(timezone.utc).strftime("%Y-W%W")
    for r in inactive_rows:
        oid = await enqueue(
            campaign_id="inactive_7d",
            recipient_key=r["tenant_id"],
            to_email=r["email"],
            dedupe_key=f"week-{week_key}",
            payload={
                "user_id": r["user_id"],
                "tenant_id": r["tenant_id"],
                "email": r["email"],
            },
        )
        if oid:
            enqueued += 1

    active_rows = await pool.fetch(
        """
        SELECT u.user_id::text, u.email, u.tenant_id::text
        FROM users u
        WHERE u.tenant_id IS NOT NULL
          AND EXISTS (
              SELECT 1 FROM events e
              WHERE e.tenant_id = u.tenant_id
                AND e.timestamp > NOW() - INTERVAL '7 days'
                AND NOT (e.agent_id = $1 AND e.event_type = 'connection_test')
          )
          AND NOT EXISTS (
              SELECT 1 FROM email_send_log l
              WHERE l.user_id = u.user_id
                AND l.campaign_id = 'active_checkin'
                AND l.sent_at > NOW() - INTERVAL '15 days'
          )
        LIMIT 200
        """,
        "dashboard-connection-test",
    )
    period_key = active_checkin_dedupe_key()
    for r in active_rows:
        oid = await enqueue(
            campaign_id="active_checkin",
            recipient_key=r["user_id"],
            to_email=r["email"],
            dedupe_key=period_key,
            payload={
                "user_id": r["user_id"],
                "tenant_id": r["tenant_id"],
                "email": r["email"],
            },
        )
        if oid:
            enqueued += 1

    return enqueued
