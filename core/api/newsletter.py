"""Newsletter subscription API."""

from __future__ import annotations

import hashlib
import logging
import secrets
import time

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

from db.connection import get_pool
from services.email.config import dashboard_url, lifecycle_enabled
from services.email.triggers import on_newsletter_subscribed

router = APIRouter()
log = logging.getLogger(__name__)

_rate: dict[str, list[float]] = {}
RATE_WINDOW_SEC = 3600
RATE_MAX = 10


class SubscribeBody(BaseModel):
    email: EmailStr
    botcheck: str | None = None
    source: str = Field(default="popup", max_length=32)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_rate(ip: str) -> None:
    now = time.time()
    hits = [t for t in _rate.get(ip, []) if now - t < RATE_WINDOW_SEC]
    if len(hits) >= RATE_MAX:
        raise HTTPException(status_code=429, detail="Too many requests. Try again later.")
    hits.append(now)
    _rate[ip] = hits


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


@router.post("/subscribe", status_code=201)
async def subscribe(body: SubscribeBody, request: Request):
    if not lifecycle_enabled():
        raise HTTPException(status_code=503, detail="Newsletter is not available at this time.")

    if body.botcheck:
        raise HTTPException(status_code=400, detail="Invalid submission")

    ip = _client_ip(request)
    _check_rate(ip)

    email = str(body.email).lower().strip()
    pool = get_pool()

    existing = await pool.fetchrow(
        """
        SELECT subscriber_id, unsubscribed_at
        FROM newsletter_subscribers WHERE email = $1
        """,
        email,
    )
    if existing and existing["unsubscribed_at"] is None:
        return {"message": "You are already subscribed.", "already_subscribed": True}

    token = secrets.token_urlsafe(32)
    token_hash = _hash_token(token)

    if existing:
        await pool.execute(
            """
            UPDATE newsletter_subscribers
            SET subscribed_at = NOW(), unsubscribed_at = NULL,
                source = $2, unsubscribe_token_hash = $3
            WHERE email = $1
            """,
            email,
            body.source,
            token_hash,
        )
    else:
        await pool.execute(
            """
            INSERT INTO newsletter_subscribers (email, source, unsubscribe_token_hash)
            VALUES ($1, $2, $3)
            """,
            email,
            body.source,
            token_hash,
        )

    if lifecycle_enabled():
        try:
            await on_newsletter_subscribed(email=email)
        except Exception as e:
            log.warning("newsletter welcome enqueue failed: %s", e)

    return {"message": "Thanks for subscribing!", "already_subscribed": False}


@router.get("/unsubscribe")
async def unsubscribe(token: str):
    if not token or len(token) < 16:
        raise HTTPException(status_code=400, detail="Invalid token")

    token_hash = _hash_token(token)
    pool = get_pool()
    row = await pool.fetchrow(
        """
        UPDATE newsletter_subscribers
        SET unsubscribed_at = NOW()
        WHERE unsubscribe_token_hash = $1 AND unsubscribed_at IS NULL
        RETURNING email
        """,
        token_hash,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Subscription not found or already unsubscribed")

    home = dashboard_url()
    return {
        "message": "You have been unsubscribed.",
        "email": row["email"],
        "home_url": home,
    }
