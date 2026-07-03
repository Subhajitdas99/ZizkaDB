"""Welcome / getting-started eligibility tests."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_eligible_welcome_when_user_exists():
    pool = MagicMock()
    pool.fetchval = AsyncMock(return_value=1)
    with patch("services.email.eligibility.get_pool", return_value=pool):
        from services.email.eligibility import eligible_welcome

        assert await eligible_welcome(user_id="u1") is True


@pytest.mark.asyncio
async def test_eligible_welcome_skips_deleted_user():
    pool = MagicMock()
    pool.fetchval = AsyncMock(return_value=None)
    with patch("services.email.eligibility.get_pool", return_value=pool):
        from services.email.eligibility import eligible_welcome

        assert await eligible_welcome(user_id="u1") is False


@pytest.mark.asyncio
async def test_check_eligibility_welcome_delegates():
    with patch(
        "services.email.eligibility.eligible_welcome",
        new_callable=AsyncMock,
        return_value=False,
    ) as mock_fn:
        from services.email.eligibility import check_eligibility

        ok = await check_eligibility("welcome", {"user_id": "u1"})
    assert ok is False
    mock_fn.assert_awaited_once_with(user_id="u1")
