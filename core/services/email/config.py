"""Campaign registry and environment helpers."""

from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime
from typing import Literal

CampaignCategory = Literal["transactional", "lifecycle", "marketing"]

# Test / dashboard connection events — excluded from activity metrics.
TEST_AGENT_ID = "dashboard-connection-test"

CALENDLY_URL = "https://calendly.com/founder-zizka/15-minutes"
FOUNDER_EMAIL = "founder@zizka.ai"


@dataclass(frozen=True)
class CampaignConfig:
    id: str
    subject: str
    template: str
    category: CampaignCategory
    enabled: bool = True
    delay_seconds: int = 0
    reply_to: str | None = None


CAMPAIGNS: dict[str, CampaignConfig] = {
    "otp": CampaignConfig(
        id="otp",
        subject="{otp} is your ZizkaDB login code",
        template="otp",
        category="transactional",
        enabled=True,
    ),
    "welcome": CampaignConfig(
        id="welcome",
        subject="Welcome to ZizkaDB",
        template="welcome",
        category="lifecycle",
        enabled=True,
        delay_seconds=300,
    ),
    "getting_started": CampaignConfig(
        id="getting_started",
        subject="Your ZizkaDB getting started guide",
        template="getting_started",
        category="lifecycle",
        enabled=True,
        delay_seconds=600,
    ),
    "no_api_72h": CampaignConfig(
        id="no_api_72h",
        subject="Create your first ZizkaDB API key",
        template="no_api_72h",
        category="lifecycle",
        enabled=True,
        delay_seconds=72 * 3600,
    ),
    "api_no_events": CampaignConfig(
        id="api_no_events",
        subject="Send your first agent event to ZizkaDB",
        template="api_no_events",
        category="lifecycle",
        enabled=True,
        delay_seconds=7 * 86400,
    ),
    "inactive_7d": CampaignConfig(
        id="inactive_7d",
        subject="Need help getting back on track with ZizkaDB?",
        template="inactive_7d",
        category="lifecycle",
        enabled=True,
        reply_to=FOUNDER_EMAIL,
    ),
    "active_checkin": CampaignConfig(
        id="active_checkin",
        subject="How is your ZizkaDB experience?",
        template="active_checkin",
        category="lifecycle",
        enabled=True,
        reply_to=FOUNDER_EMAIL,
    ),
    "account_deleted": CampaignConfig(
        id="account_deleted",
        subject="We're sorry to see you go — come back anytime",
        template="account_deleted",
        category="transactional",
        enabled=True,
    ),
    "newsletter_welcome": CampaignConfig(
        id="newsletter_welcome",
        subject="You're subscribed to ZizkaDB updates",
        template="newsletter_welcome",
        category="marketing",
        enabled=True,
    ),
}


def _truthy(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).strip().lower() in ("1", "true", "yes", "on")


def lifecycle_enabled() -> bool:
    return _truthy("EMAIL_LIFECYCLE_ENABLED", "false")


def compress_delays() -> bool:
    """Staging/dev: map long delays to ~5 minutes. Never enable in production."""
    if os.getenv("ENV", "development") == "production":
        return False
    return _truthy("EMAIL_STAGING_COMPRESS_DELAYS", "false")


def effective_delay_seconds(seconds: int) -> int:
    if not compress_delays():
        return seconds
    if seconds <= 600:
        return seconds
    return 300


def dev_redirect_email() -> str | None:
    addr = os.getenv("EMAIL_DEV_REDIRECT", "").strip()
    return addr or None


def allowlist() -> set[str] | None:
    raw = os.getenv("EMAIL_LIFECYCLE_ALLOWLIST", "").strip()
    if not raw:
        return None
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


def is_recipient_allowed(email: str, *, category: CampaignCategory) -> bool:
    if category == "transactional":
        return True
    if not lifecycle_enabled():
        return False
    if not smtp_configured_for_lifecycle():
        return False
    allowed = allowlist()
    if allowed is not None:
        return email.lower().strip() in allowed
    return True


def smtp_configured_for_lifecycle() -> bool:
    from services.email.providers.smtp import smtp_configured

    return smtp_configured()


def get_campaign(campaign_id: str) -> CampaignConfig | None:
    cfg = CAMPAIGNS.get(campaign_id)
    if not cfg or not cfg.enabled:
        return None
    return cfg


def dashboard_url() -> str:
    return os.getenv("DASHBOARD_URL", "https://db.zizka.ai").rstrip("/")


def docs_url() -> str:
    return f"{dashboard_url()}/docs"


def active_checkin_dedupe_key(when: datetime | None = None) -> str:
    """Rolling 15-day window key so C6 can repeat every ~15 days."""
    from datetime import timezone

    ts = (when or datetime.now(timezone.utc)).timestamp()
    window = int(ts // (15 * 86400))
    return f"window-{window}"
