"""Email outbox unit tests."""

import json
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.fixture
def mock_pool():
    pool = MagicMock()
    pool.fetchrow = AsyncMock()
    pool.execute = AsyncMock()
    pool.acquire = MagicMock()
    return pool


@pytest.mark.asyncio
async def test_enqueue_returns_id(mock_pool):
    mock_pool.fetchrow.return_value = ("abc-123",)
    with patch("services.email.outbox.get_pool", return_value=mock_pool):
        from services.email.outbox import enqueue

        oid = await enqueue(
            campaign_id="welcome",
            recipient_key="user-1",
            to_email="test@example.com",
            payload={"user_id": "user-1"},
        )
    assert oid == "abc-123"
    mock_pool.fetchrow.assert_awaited_once()


@pytest.mark.asyncio
async def test_enqueue_duplicate_returns_none(mock_pool):
    mock_pool.fetchrow.return_value = None
    with patch("services.email.outbox.get_pool", return_value=mock_pool):
        from services.email.outbox import enqueue

        oid = await enqueue(
            campaign_id="welcome",
            recipient_key="user-1",
            to_email="test@example.com",
        )
    assert oid is None


@pytest.mark.asyncio
async def test_cancel_pending_for_user(mock_pool):
    mock_pool.execute.return_value = "UPDATE 3"
    with patch("services.email.outbox.get_pool", return_value=mock_pool):
        from services.email.outbox import cancel_pending_for_user

        n = await cancel_pending_for_user("user-1")
    assert n == 3
