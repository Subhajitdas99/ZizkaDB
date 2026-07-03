"""SMTP email provider (stdlib smtplib)."""

from __future__ import annotations

import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from services.email.providers.base import SendResult

SMTP_TIMEOUT_SEC = int(os.getenv("EMAIL_SMTP_TIMEOUT", "15"))


def smtp_configured() -> bool:
    return bool(
        os.getenv("EMAIL_HOST")
        and os.getenv("EMAIL_USER")
        and os.getenv("EMAIL_PASS")
    )


def default_from_addr() -> str:
    user = os.getenv("EMAIL_USER", "")
    return os.getenv("EMAIL_FROM", f'"ZizkaDB" <{user}>')


class SmtpEmailProvider:
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
        host = os.getenv("EMAIL_HOST")
        user = os.getenv("EMAIL_USER")
        password = os.getenv("EMAIL_PASS")

        if not host or not user or not password:
            print(f"\n{'='*50}", flush=True)
            print(f"EMAIL TO {to_email}", flush=True)
            print(f"SUBJECT: {subject}", flush=True)
            print(f"(Set EMAIL_HOST / EMAIL_USER / EMAIL_PASS to send real emails)", flush=True)
            print(f"{'='*50}\n", flush=True)
            return SendResult(provider_message_id="stdout")

        port = int(os.getenv("EMAIL_PORT", "587"))
        is_ssl = port == 465

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_addr
        msg["To"] = to_email
        if reply_to:
            msg["Reply-To"] = reply_to

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        if is_ssl:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(
                host, port, context=context, timeout=SMTP_TIMEOUT_SEC,
            ) as server:
                server.login(user, password)
                server.sendmail(from_addr, to_email, msg.as_string())
        else:
            with smtplib.SMTP(host, port, timeout=SMTP_TIMEOUT_SEC) as server:
                server.starttls()
                server.login(user, password)
                server.sendmail(from_addr, to_email, msg.as_string())

        return SendResult(provider_message_id=None)
