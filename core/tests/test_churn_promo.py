"""Churn promo code tests."""

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_generate_promo_code_format():
    from services.email.churn import generate_promo_code

    code = generate_promo_code()
    assert code.startswith("COMEBACK-")


@pytest.mark.asyncio
async def test_redeem_invalid_code():
    pool = MagicMock()
    pool.fetchrow = AsyncMock(return_value=None)
    with patch("services.email.churn.get_pool", return_value=pool):
        from services.email.churn import redeem_churn_promo

        ok = await redeem_churn_promo(
            email="a@b.com",
            promo_code="COMEBACK-INVALID",
            user_id="u1",
        )
    assert ok is False


@pytest.mark.asyncio
async def test_redeem_success():
    pool = MagicMock()
    pool.fetchrow = AsyncMock(
        return_value={
            "offer_id": "o1",
            "expires_at": datetime.now(timezone.utc) + timedelta(days=1),
            "redeemed_at": None,
        }
    )
    conn = MagicMock()
    conn.fetchval = AsyncMock(return_value="o1")
    conn.execute = AsyncMock()
    txn = MagicMock()
    txn.__aenter__ = AsyncMock(return_value=None)
    txn.__aexit__ = AsyncMock(return_value=None)
    conn.transaction = MagicMock(return_value=txn)
    pool.acquire = MagicMock()
    pool.acquire.return_value.__aenter__ = AsyncMock(return_value=conn)
    pool.acquire.return_value.__aexit__ = AsyncMock(return_value=None)

    with patch("services.email.churn.get_pool", return_value=pool):
        from services.email.churn import redeem_churn_promo

        ok = await redeem_churn_promo(
            email="a@b.com",
            promo_code="COMEBACK-ABC",
            user_id="u1",
        )
    assert ok is True


@pytest.mark.asyncio
async def test_redeem_expired_code():
    pool = MagicMock()
    pool.fetchrow = AsyncMock(
        return_value={
            "offer_id": "o1",
            "expires_at": datetime.now(timezone.utc) - timedelta(days=1),
            "redeemed_at": None,
        }
    )
    with patch("services.email.churn.get_pool", return_value=pool):
        from services.email.churn import redeem_churn_promo

        ok = await redeem_churn_promo(
            email="a@b.com",
            promo_code="COMEBACK-OLD",
            user_id="u1",
        )
    assert ok is False


@pytest.mark.asyncio
async def test_redeem_double_redeem():
    pool = MagicMock()
    pool.fetchrow = AsyncMock(
        return_value={
            "offer_id": "o1",
            "expires_at": datetime.now(timezone.utc) + timedelta(days=1),
            "redeemed_at": datetime.now(timezone.utc),
        }
    )
    with patch("services.email.churn.get_pool", return_value=pool):
        from services.email.churn import redeem_churn_promo

        ok = await redeem_churn_promo(
            email="a@b.com",
            promo_code="COMEBACK-USED",
            user_id="u1",
        )
    assert ok is False
