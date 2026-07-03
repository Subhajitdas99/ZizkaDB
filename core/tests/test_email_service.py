"""EmailService unit tests."""

from unittest.mock import patch

import pytest

from services.email.providers.mock import MockEmailProvider
from services.email.service import EmailService


@pytest.mark.asyncio
async def test_send_otp_uses_template():
    provider = MockEmailProvider()
    svc = EmailService(provider)
    await svc.send_otp("user@example.com", "123456")
    assert len(provider.sent) == 1
    assert provider.sent[0]["to_email"] == "user@example.com"
    assert "123456" in provider.sent[0]["html_body"]


@pytest.mark.asyncio
async def test_send_template_skipped_when_not_allowed():
    provider = MockEmailProvider()
    svc = EmailService(provider)
    with patch("services.email.service.is_recipient_allowed", return_value=False):
        with patch("services.email.service.get_campaign") as mock_camp:
            from services.email.config import CampaignConfig
            mock_camp.return_value = CampaignConfig(
                id="welcome",
                subject="Welcome",
                template="welcome",
                category="lifecycle",
            )
            result = await svc.send_template(
                campaign_id="welcome",
                to_email="user@example.com",
                context={"plan_name": "Pro"},
            )
    assert result == "skipped"
    assert len(provider.sent) == 0


@pytest.mark.asyncio
async def test_dev_redirect():
    provider = MockEmailProvider()
    svc = EmailService(provider)
    with patch("services.email.service.dev_redirect_email", return_value="dev@test.com"):
        with patch("services.email.service.is_recipient_allowed", return_value=True):
            with patch("services.email.service.get_campaign") as mock_camp:
                from services.email.config import CampaignConfig
                mock_camp.return_value = CampaignConfig(
                    id="welcome",
                    subject="Welcome {plan_name}",
                    template="welcome",
                    category="lifecycle",
                )
                result = await svc.send_template(
                    campaign_id="welcome",
                    to_email="user@example.com",
                    context={"plan_name": "Pro", "dashboard_url": "http://localhost:3001"},
                )
    assert result == "sent"
    assert provider.sent[0]["to_email"] == "dev@test.com"
