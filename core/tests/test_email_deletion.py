"""Account deletion lifecycle email tests."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_delete_cancels_pending_and_enqueues_c7():
    pool = MagicMock()
    pool.fetchrow = AsyncMock(
        return_value={
            "user_id": "u1",
            "email": "user@example.com",
            "tenant_id": "t1",
        }
    )
    conn = MagicMock()
    conn.execute = AsyncMock()
    txn = MagicMock()
    txn.__aenter__ = AsyncMock(return_value=None)
    txn.__aexit__ = AsyncMock(return_value=None)
    conn.transaction = MagicMock(return_value=txn)
    pool.acquire = MagicMock()
    pool.acquire.return_value.__aenter__ = AsyncMock(return_value=conn)
    pool.acquire.return_value.__aexit__ = AsyncMock(return_value=None)

    offer = {"promo_code": "COMEBACK-ABC", "expires_at": "2026-12-31T00:00:00Z"}
    cancel_user = AsyncMock(return_value=2)
    cancel_tenant = AsyncMock(return_value=1)
    enqueue = AsyncMock()

    with patch("services.account.get_pool", return_value=pool):
        with patch("services.account.managed_cloud_only", return_value=True):
            with patch("services.email.config.lifecycle_enabled", return_value=True):
                with patch("services.account._purge_tenant_vectors", new_callable=AsyncMock):
                    with patch(
                        "services.email.churn.create_churn_offer",
                        new_callable=AsyncMock,
                        return_value=offer,
                    ):
                        with patch(
                            "services.email.outbox.cancel_pending_for_user", cancel_user
                        ):
                            with patch(
                                "services.email.outbox.cancel_pending_for_tenant",
                                cancel_tenant,
                            ):
                                with patch(
                                    "services.email.triggers.on_account_deleted_enqueue",
                                    enqueue,
                                ):
                                    from services.account import delete_managed_account

                                    await delete_managed_account(
                                        user_id="u1", tenant_id="t1"
                                    )

    cancel_user.assert_awaited_once_with("u1")
    cancel_tenant.assert_awaited_once_with("t1")
    enqueue.assert_awaited_once()
    assert enqueue.await_args.kwargs["promo_code"] == "COMEBACK-ABC"


@pytest.mark.asyncio
async def test_delete_skips_churn_when_lifecycle_disabled():
    pool = MagicMock()
    pool.fetchrow = AsyncMock(
        return_value={
            "user_id": "u1",
            "email": "user@example.com",
            "tenant_id": "t1",
        }
    )
    conn = MagicMock()
    conn.execute = AsyncMock()
    txn = MagicMock()
    txn.__aenter__ = AsyncMock(return_value=None)
    txn.__aexit__ = AsyncMock(return_value=None)
    conn.transaction = MagicMock(return_value=txn)
    pool.acquire = MagicMock()
    pool.acquire.return_value.__aenter__ = AsyncMock(return_value=conn)
    pool.acquire.return_value.__aexit__ = AsyncMock(return_value=None)

    cancel = AsyncMock(return_value=0)
    cancel_tenant = AsyncMock(return_value=0)
    create_offer = AsyncMock()
    enqueue = AsyncMock()

    with patch("services.account.get_pool", return_value=pool):
        with patch("services.account.managed_cloud_only", return_value=True):
            with patch("services.email.config.lifecycle_enabled", return_value=False):
                with patch("services.account._purge_tenant_vectors", new_callable=AsyncMock):
                    with patch(
                        "services.email.churn.create_churn_offer", create_offer
                    ):
                        with patch(
                            "services.email.outbox.cancel_pending_for_user", cancel
                        ):
                            with patch(
                                "services.email.outbox.cancel_pending_for_tenant",
                                cancel_tenant,
                            ):
                                with patch(
                                    "services.email.triggers.on_account_deleted_enqueue",
                                    enqueue,
                                ):
                                    from services.account import delete_managed_account

                                    await delete_managed_account(
                                        user_id="u1", tenant_id="t1"
                                    )

    cancel.assert_awaited_once_with("u1")
    cancel_tenant.assert_awaited_once_with("t1")
    create_offer.assert_not_awaited()
    enqueue.assert_not_awaited()
