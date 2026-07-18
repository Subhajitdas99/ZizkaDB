"""Shared SMTP helpers for OTP and outreach email."""

from __future__ import annotations

import asyncio
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

log = logging.getLogger(__name__)

SMTP_TIMEOUT_SEC = int(os.getenv("EMAIL_SMTP_TIMEOUT", "15"))


def smtp_configured() -> bool:
    return bool(os.getenv("EMAIL_HOST") and os.getenv("EMAIL_USER") and os.getenv("EMAIL_PASS"))


def send_email_sync(
    *,
    to_email: str,
    subject: str,
    text_body: str,
    html_body: str,
    reply_to: str | None = None,
) -> None:
    """Blocking SMTP send. Call via asyncio.to_thread from async handlers."""
    host = os.getenv("EMAIL_HOST")
    user = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASS")

    if not host or not user or not password:
        print(f"\n{'=' * 50}")
        print(f"EMAIL (dev fallback) → {to_email}")
        print(f"Subject: {subject}")
        print(text_body[:500])
        print(f"(Set EMAIL_HOST / EMAIL_USER / EMAIL_PASS to send real emails)")
        print(f"{'=' * 50}\n", flush=True)
        return

    port = int(os.getenv("EMAIL_PORT", "587"))
    from_addr = os.getenv("EMAIL_FROM", f'"ZizkaDB" <{user}>')
    is_ssl = port == 465

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to_email
    if reply_to:
        msg["Reply-To"] = reply_to

    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    if is_ssl:
        import ssl

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(host, port, context=context, timeout=SMTP_TIMEOUT_SEC) as server:
            server.login(user, password)
            server.sendmail(from_addr, [to_email], msg.as_string())
    else:
        with smtplib.SMTP(host, port, timeout=SMTP_TIMEOUT_SEC) as server:
            server.starttls()
            server.login(user, password)
            server.sendmail(from_addr, [to_email], msg.as_string())


async def send_email(
    *,
    to_email: str,
    subject: str,
    text_body: str,
    html_body: str,
    reply_to: str | None = None,
) -> None:
    await asyncio.to_thread(
        send_email_sync,
        to_email=to_email,
        subject=subject,
        text_body=text_body,
        html_body=html_body,
        reply_to=reply_to,
    )
