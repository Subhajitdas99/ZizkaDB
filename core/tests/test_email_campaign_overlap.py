"""C4 vs C5 mutual exclusion tests."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_c4_and_c5_never_both_qualify():
    """C4 needs keys + no events ever; C5 needs keys + events + quiet 7d."""
    from services.email.eligibility import eligible_api_no_events, eligible_inactive_7d

    # Tenant with keys but never sent real events → C4 only
    pool_c4 = MagicMock()
    pool_c4.fetchval = AsyncMock(side_effect=[1, None, 1, None])
    with patch("services.email.eligibility.get_pool", return_value=pool_c4):
        c4 = await eligible_api_no_events(tenant_id="t1")
        c5 = await eligible_inactive_7d(tenant_id="t1")

    assert c4 is True
    assert c5 is False

    # Tenant with keys, history, and quiet week → C5 only
    pool_c5 = MagicMock()
    pool_c5.fetchval = AsyncMock(side_effect=[1, 1, 1, 1, None])
    with patch("services.email.eligibility.get_pool", return_value=pool_c5):
        c4 = await eligible_api_no_events(tenant_id="t1")
        c5 = await eligible_inactive_7d(tenant_id="t1")

    assert c4 is False
    assert c5 is True
