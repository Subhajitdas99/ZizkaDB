"""Email send service — single entrypoint for all outbound mail."""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Literal

from services.email.config import (
    dev_redirect_email,
    get_campaign,
    is_recipient_allowed,
)
from services.email.providers.base import EmailProvider
from services.email.providers.smtp import SmtpEmailProvider, default_from_addr
from services.email.renderer import render_subject, render_template

log = logging.getLogger(__name__)

SendResult = Literal["sent", "skipped"]

_default_provider: EmailProvider | None = None


def get_email_service(provider: EmailProvider | None = None) -> "EmailService":
    global _default_provider
    if provider is not None:
        return EmailService(provider)
    if _default_provider is None:
        _default_provider = SmtpEmailProvider()
    return EmailService(_default_provider)


class EmailService:
    def __init__(self, provider: EmailProvider) -> None:
        self._provider = provider

    async def send_template(
        self,
        *,
        campaign_id: str,
        to_email: str,
        context: dict[str, Any],
        reply_to: str | None = None,
    ) -> SendResult:
        cfg = get_campaign(campaign_id)
        if not cfg:
            log.debug("campaign %s disabled or missing", campaign_id)
            return "skipped"
        if not is_recipient_allowed(to_email, category=cfg.category):
            log.debug("recipient not allowed for campaign=%s", campaign_id)
            return "skipped"

        dest = dev_redirect_email() or to_email
        subject = render_subject(cfg.subject, context)
        html_body, text_body = render_template(cfg.template, context)
        from_addr = default_from_addr()
        rt = reply_to or cfg.reply_to

        await asyncio.to_thread(
            self._provider.send_sync,
            to_email=dest,
            subject=subject,
            html_body=html_body,
            text_body=text_body,
            from_addr=from_addr,
            reply_to=rt,
        )
        return "sent"

    async def send_otp(self, email: str, otp: str) -> SendResult:
        await self.send_template(
            campaign_id="otp",
            to_email=email,
            context={"otp": otp},
        )
