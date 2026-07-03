"""Signup lifecycle trigger tests."""

from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_on_signup_enqueues_three_campaigns():
    enqueue = AsyncMock(side_effect=["id1", "id2", "id3"])
    with patch("services.email.triggers.lifecycle_enabled", return_value=True):
        with patch("services.email.triggers.enqueue", enqueue):
            from services.email.triggers import on_signup_completed

            await on_signup_completed(
                user_id="u1",
                email="a@b.com",
                tenant_id="t1",
            )
    assert enqueue.await_count == 3
    campaigns = [c.kwargs["campaign_id"] for c in enqueue.await_args_list]
    assert campaigns == ["welcome", "getting_started", "no_api_72h"]


@pytest.mark.asyncio
async def test_on_signup_skipped_when_disabled():
    enqueue = AsyncMock()
    with patch("services.email.triggers.lifecycle_enabled", return_value=False):
        with patch("services.email.triggers.enqueue", enqueue):
            from services.email.triggers import on_signup_completed

            await on_signup_completed(user_id="u1", email="a@b.com", tenant_id="t1")
    enqueue.assert_not_awaited()
