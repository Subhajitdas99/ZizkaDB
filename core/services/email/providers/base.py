"""Email provider protocol."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class SendResult:
    provider_message_id: str | None = None


class EmailProvider(Protocol):
    def send_sync(
        self,
        *,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: str,
        from_addr: str,
        reply_to: str | None = None,
    ) -> SendResult:
        """Blocking send — call via asyncio.to_thread from async code."""
