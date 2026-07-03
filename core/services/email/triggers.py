"""Lifecycle email triggers — enqueue only, never block callers."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from services.email.config import CAMPAIGNS, effective_delay_seconds, lifecycle_enabled
from services.email.outbox import enqueue

log = logging.getLogger(__name__)


def _fire(coro) -> None:
    """Schedule coroutine without blocking or failing the caller."""
    try:
        asyncio.get_running_loop().create_task(_safe_enqueue(coro))
    except RuntimeError:
        pass


async def _safe_enqueue(coro):
    try:
        await coro
    except Exception as e:
        log.warning("email trigger failed: %s", e)


async def on_signup_completed(
    *,
    user_id: str,
    email: str,
    tenant_id: str,
) -> None:
    if not lifecycle_enabled():
        return
    now = datetime.now(timezone.utc)
    payload = {"user_id": user_id, "tenant_id": tenant_id, "email": email}

    welcome_delay = effective_delay_seconds(CAMPAIGNS["welcome"].delay_seconds)
    gs_delay = effective_delay_seconds(CAMPAIGNS["getting_started"].delay_seconds)
    no_api_delay = effective_delay_seconds(CAMPAIGNS["no_api_72h"].delay_seconds)

    await enqueue(
        campaign_id="welcome",
        recipient_key=user_id,
        to_email=email,
        payload=payload,
        scheduled_at=now + timedelta(seconds=welcome_delay),
    )
    await enqueue(
        campaign_id="getting_started",
        recipient_key=user_id,
        to_email=email,
        payload=payload,
        scheduled_at=now + timedelta(seconds=gs_delay),
    )
    await enqueue(
        campaign_id="no_api_72h",
        recipient_key=user_id,
        to_email=email,
        payload=payload,
        scheduled_at=now + timedelta(seconds=no_api_delay),
    )


def schedule_signup_lifecycle(*, user_id: str, email: str, tenant_id: str) -> None:
    _fire(on_signup_completed(user_id=user_id, email=email, tenant_id=tenant_id))


async def on_api_key_created(*, tenant_id: str, user_id: str, email: str) -> None:
    if not lifecycle_enabled():
        return
    delay = effective_delay_seconds(CAMPAIGNS["api_no_events"].delay_seconds)
    now = datetime.now(timezone.utc)
    await enqueue(
        campaign_id="api_no_events",
        recipient_key=tenant_id,
        to_email=email,
        payload={"tenant_id": tenant_id, "user_id": user_id, "email": email},
        dedupe_key="first_key",
        scheduled_at=now + timedelta(seconds=delay),
    )


def schedule_api_key_lifecycle(*, tenant_id: str, user_id: str, email: str) -> None:
    _fire(on_api_key_created(tenant_id=tenant_id, user_id=user_id, email=email))


async def on_account_deleted_enqueue(
    *,
    email: str,
    promo_code: str,
    promo_expires_at: str,
    delete_id: str,
) -> None:
    if not lifecycle_enabled():
        return
    from services.email.config import dashboard_url

    signup_url = f"{dashboard_url()}/signup/plan?promo={promo_code}"
    await enqueue(
        campaign_id="account_deleted",
        recipient_key=email,
        to_email=email,
        dedupe_key=delete_id,
        payload={
            "email": email,
            "promo_code": promo_code,
            "promo_expires_at": promo_expires_at,
            "signup_url": signup_url,
        },
        scheduled_at=datetime.now(timezone.utc),
    )


async def on_newsletter_subscribed(*, email: str) -> None:
    if not lifecycle_enabled():
        return
    from services.email.config import docs_url

    await enqueue(
        campaign_id="newsletter_welcome",
        recipient_key=email.lower(),
        to_email=email,
        payload={"email": email, "docs_url": docs_url()},
        scheduled_at=datetime.now(timezone.utc),
    )
