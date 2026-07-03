"""Email processor unit tests."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from datetime import datetime, timezone, timedelta


def test_active_checkin_dedupe_key_15_day_windows():
    from services.email.config import active_checkin_dedupe_key

    t0 = datetime(2026, 1, 1, tzinfo=timezone.utc)
    assert active_checkin_dedupe_key(t0) == active_checkin_dedupe_key(t0)
    t1 = t0 + timedelta(days=15)
    assert active_checkin_dedupe_key(t0) != active_checkin_dedupe_key(t1)


@pytest.mark.asyncio
async def test_processor_cancels_when_send_skipped_not_mark_sent():
    row = {
        "outbox_id": "oid-1",
        "campaign_id": "welcome",
        "payload": {"user_id": "u1", "tenant_id": "t1"},
        "to_email": "blocked@example.com",
        "attempts": 0,
    }
    svc = MagicMock()
    svc.send_template = AsyncMock(return_value="skipped")
    cancel = AsyncMock()
    mark_sent_fn = AsyncMock()

    with patch("services.email.processor.lifecycle_enabled", return_value=True):
        with patch("services.email.processor.claim_batch", AsyncMock(return_value=[row])):
            with patch("services.email.processor.get_email_service", return_value=svc):
                with patch("services.email.processor.check_eligibility", AsyncMock(return_value=True)):
                    with patch("services.email.processor.build_context", AsyncMock(return_value={})):
                        with patch("services.email.processor.cancel_outbox_row", cancel):
                            with patch("services.email.processor.mark_sent", mark_sent_fn):
                                from services.email.processor import process_outbox_batch

                                n = await process_outbox_batch()

    assert n == 0
    cancel.assert_awaited_once()
    assert "not allowed" in cancel.await_args.args[1]
    mark_sent_fn.assert_not_awaited()


@pytest.mark.asyncio
async def test_processor_marks_sent_when_delivered():
    row = {
        "outbox_id": "oid-2",
        "campaign_id": "welcome",
        "payload": {"user_id": "u1", "tenant_id": "t1"},
        "to_email": "ok@example.com",
        "attempts": 0,
    }
    svc = MagicMock()
    svc.send_template = AsyncMock(return_value="sent")
    cancel = AsyncMock()
    mark_sent_fn = AsyncMock()

    with patch("services.email.processor.lifecycle_enabled", return_value=True):
        with patch("services.email.processor.claim_batch", AsyncMock(return_value=[row])):
            with patch("services.email.processor.get_email_service", return_value=svc):
                with patch("services.email.processor.check_eligibility", AsyncMock(return_value=True)):
                    with patch("services.email.processor.build_context", AsyncMock(return_value={})):
                        with patch("services.email.processor.cancel_outbox_row", cancel):
                            with patch("services.email.processor.mark_sent", mark_sent_fn):
                                from services.email.processor import process_outbox_batch

                                n = await process_outbox_batch()

    assert n == 1
    cancel.assert_not_awaited()
    mark_sent_fn.assert_awaited_once()
