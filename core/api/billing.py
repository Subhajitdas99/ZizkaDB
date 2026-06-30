"""
Stripe webhooks — sync subscription state to users table for admin visibility.
Configure STRIPE_WEBHOOK_SECRET and point Stripe to POST /v1/webhooks/stripe
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request

from db.connection import get_pool

router = APIRouter()
log = logging.getLogger(__name__)

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")


async def _update_user_billing(
    *,
    user_id: str | None = None,
    email: str | None = None,
    stripe_customer_id: str | None = None,
    stripe_subscription_id: str | None = None,
    plan: str | None = None,
    subscription_status: str | None = None,
    trial_ends_at: datetime | None = None,
) -> bool:
    pool = get_pool()
    if user_id:
        row = await pool.execute(
            """
            UPDATE users SET
                plan = COALESCE($2, plan),
                subscription_status = COALESCE($3, subscription_status),
                trial_ends_at = COALESCE($4, trial_ends_at),
                stripe_customer_id = COALESCE($5, stripe_customer_id),
                stripe_subscription_id = COALESCE($6, stripe_subscription_id)
            WHERE user_id = $1::uuid
            """,
            user_id,
            plan,
            subscription_status,
            trial_ends_at,
            stripe_customer_id,
            stripe_subscription_id,
        )
        return row == "UPDATE 1"
    if email:
        row = await pool.execute(
            """
            UPDATE users SET
                plan = COALESCE($2, plan),
                subscription_status = COALESCE($3, subscription_status),
                trial_ends_at = COALESCE($4, trial_ends_at),
                stripe_customer_id = COALESCE($5, stripe_customer_id),
                stripe_subscription_id = COALESCE($6, stripe_subscription_id)
            WHERE email = $1
            """,
            email.lower().strip(),
            plan,
            subscription_status,
            trial_ends_at,
            stripe_customer_id,
            stripe_subscription_id,
        )
        return row == "UPDATE 1"
    return False


@router.post("/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Stripe webhook not configured")

    try:
        import stripe
    except ImportError:
        raise HTTPException(status_code=500, detail="stripe package not installed")

    stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
    payload = await request.body()
    sig = request.headers.get("stripe-signature")
    if not sig:
        raise HTTPException(status_code=400, detail="Missing stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        log.warning("Stripe webhook verify failed: %s", e)
        raise HTTPException(status_code=400, detail="Invalid signature")

    data = event.data.object
    etype = event.type

    try:
        if etype == "checkout.session.completed":
            meta = getattr(data, "metadata", None) or {}
            user_id = meta.get("user_id")
            plan = meta.get("plan", "pro")
            sub_id = getattr(data, "subscription", None)
            customer_id = getattr(data, "customer", None)
            trial_end = None
            status = "trialing"
            if sub_id:
                sub = stripe.Subscription.retrieve(sub_id)
                status = sub.status
                if sub.trial_end:
                    trial_end = datetime.fromtimestamp(sub.trial_end, tz=timezone.utc)
            await _update_user_billing(
                user_id=user_id,
                plan=plan,
                subscription_status=status,
                trial_ends_at=trial_end,
                stripe_customer_id=str(customer_id) if customer_id else None,
                stripe_subscription_id=str(sub_id) if sub_id else None,
            )

        elif etype in ("customer.subscription.updated", "customer.subscription.created"):
            sub = data
            meta = getattr(sub, "metadata", None) or {}
            user_id = meta.get("user_id")
            trial_end = None
            if getattr(sub, "trial_end", None):
                trial_end = datetime.fromtimestamp(sub.trial_end, tz=timezone.utc)
            await _update_user_billing(
                user_id=user_id,
                stripe_subscription_id=getattr(sub, "id", None),
                stripe_customer_id=str(sub.customer) if getattr(sub, "customer", None) else None,
                subscription_status=getattr(sub, "status", None),
                trial_ends_at=trial_end,
                plan=meta.get("plan"),
            )

        elif etype == "customer.subscription.deleted":
            sub = data
            meta = getattr(sub, "metadata", None) or {}
            user_id = meta.get("user_id")
            await _update_user_billing(
                user_id=user_id,
                subscription_status="canceled",
            )

    except Exception as e:
        log.error("Stripe webhook handler error: %s", e)
        raise HTTPException(status_code=500, detail="Webhook handler failed")

    return {"received": True}
