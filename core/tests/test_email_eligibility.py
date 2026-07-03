"""Scheduled campaign eligibility matrix tests."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


def _pool(fetchval_side_effect):
    pool = MagicMock()
    pool.fetchval = AsyncMock(side_effect=fetchval_side_effect)
    return pool


@pytest.mark.asyncio
async def test_no_api_72h_requires_user_and_no_keys():
    pool = _pool([1, 0])  # user exists, zero keys
    with patch("services.email.eligibility.get_pool", return_value=pool):
        from services.email.eligibility import eligible_no_api_72h

        assert await eligible_no_api_72h(user_id="u1", tenant_id="t1") is True

    pool = _pool([None])  # user deleted
    with patch("services.email.eligibility.get_pool", return_value=pool):
        from services.email.eligibility import eligible_no_api_72h

        assert await eligible_no_api_72h(user_id="u1", tenant_id="t1") is False


@pytest.mark.asyncio
async def test_api_no_events_requires_keys_without_events():
    pool = _pool([2, None])  # 2 keys, no real events
    with patch("services.email.eligibility.get_pool", return_value=pool):
        from services.email.eligibility import eligible_api_no_events

        assert await eligible_api_no_events(tenant_id="t1") is True

    pool = _pool([0])  # no keys
    with patch("services.email.eligibility.get_pool", return_value=pool):
        from services.email.eligibility import eligible_api_no_events

        assert await eligible_api_no_events(tenant_id="t1") is False


@pytest.mark.asyncio
async def test_inactive_7d_requires_history_and_quiet_week():
    pool = _pool([1, 1, None])  # keys, had events, no events in 7d
    with patch("services.email.eligibility.get_pool", return_value=pool):
        from services.email.eligibility import eligible_inactive_7d

        assert await eligible_inactive_7d(tenant_id="t1") is True


@pytest.mark.asyncio
async def test_active_checkin_requires_recent_activity_and_no_recent_send():
    pool = _pool([1, 1, None])  # user exists, events in 7d, no recent C6 send
    with patch("services.email.eligibility.get_pool", return_value=pool):
        from services.email.eligibility import eligible_active_checkin

        assert await eligible_active_checkin(user_id="u1", tenant_id="t1") is True

    pool = _pool([1, None])  # user exists, no recent events
    with patch("services.email.eligibility.get_pool", return_value=pool):
        from services.email.eligibility import eligible_active_checkin

        assert await eligible_active_checkin(user_id="u1", tenant_id="t1") is False
