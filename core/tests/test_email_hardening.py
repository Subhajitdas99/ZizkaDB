"""Additional auth + email hardening tests."""

from unittest.mock import AsyncMock, MagicMock, patch

import bcrypt
import pytest
from fastapi.testclient import TestClient

from main import app
from services.auth import _promo_rate, _check_promo_rate_limit, request_otp

client = TestClient(app)


@pytest.mark.asyncio
async def test_request_otp_succeeds_when_send_fails():
    pool = MagicMock()
    pool.execute = AsyncMock()
    svc = MagicMock()
    svc.send_otp = AsyncMock(side_effect=RuntimeError("SMTP down"))

    with patch("services.auth.get_pool", return_value=pool):
        with patch("services.email.service.get_email_service", return_value=svc):
            await request_otp("user@example.com")

    assert pool.execute.await_count == 2
    svc.send_otp.assert_awaited_once()


def test_promo_rate_limit_raises():
    _promo_rate.clear()
    email = "promo-test@example.com"
    for _ in range(10):
        _check_promo_rate_limit(email)
    with pytest.raises(ValueError, match="Too many promo"):
        _check_promo_rate_limit(email)
    _promo_rate.clear()


@pytest.mark.asyncio
async def test_newsletter_sync_unsubscribes_when_marketing_declined():
    pool = MagicMock()
    pool.fetchrow = AsyncMock(
        return_value={"subscriber_id": "s1", "unsubscribed_at": None}
    )
    pool.execute = AsyncMock()
    with patch("services.email.newsletter_sync.get_pool", return_value=pool):
        from services.email.newsletter_sync import sync_newsletter_on_signup

        await sync_newsletter_on_signup(
            email="user@example.com",
            marketing_consent=False,
        )
    pool.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_newsletter_sync_noop_when_no_row():
    pool = MagicMock()
    pool.fetchrow = AsyncMock(return_value=None)
    pool.execute = AsyncMock()
    with patch("services.email.newsletter_sync.get_pool", return_value=pool):
        from services.email.newsletter_sync import sync_newsletter_on_signup

        await sync_newsletter_on_signup(
            email="new@example.com",
            marketing_consent=True,
        )
    pool.execute.assert_not_awaited()
