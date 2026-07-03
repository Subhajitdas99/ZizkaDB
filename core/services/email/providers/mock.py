"""In-memory email provider for tests."""

from __future__ import annotations

from dataclasses import dataclass, field

from services.email.providers.base import SendResult


@dataclass
class MockEmailProvider:
    sent: list[dict] = field(default_factory=list)

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
        self.sent.append(
            {
                "to_email": to_email,
                "subject": subject,
                "html_body": html_body,
                "text_body": text_body,
                "from_addr": from_addr,
                "reply_to": reply_to,
            }
        )
        return SendResult(provider_message_id=f"mock-{len(self.sent)}")
