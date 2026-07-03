"""Newsletter API tests."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


@pytest.fixture
def mock_pool():
    pool = MagicMock()
    pool.fetchrow = AsyncMock(return_value=None)
    pool.execute = AsyncMock()
    return pool


def test_subscribe_rejects_honeypot():
    with patch("api.newsletter.lifecycle_enabled", return_value=True):
        res = client.post(
            "/v1/newsletter/subscribe",
            json={"email": "test@example.com", "botcheck": "spam"},
        )
    assert res.status_code == 400


def test_subscribe_disabled_when_lifecycle_off():
    with patch("api.newsletter.lifecycle_enabled", return_value=False):
        res = client.post(
            "/v1/newsletter/subscribe",
            json={"email": "test@example.com", "botcheck": ""},
        )
    assert res.status_code == 503


def test_subscribe_success(mock_pool):
    with patch("api.newsletter.get_pool", return_value=mock_pool):
        with patch("api.newsletter.lifecycle_enabled", return_value=True):
            with patch("api.newsletter.on_newsletter_subscribed", new_callable=AsyncMock):
                res = client.post(
                    "/v1/newsletter/subscribe",
                    json={"email": "new@example.com", "botcheck": ""},
                )
    assert res.status_code == 201
    assert "Thanks" in res.json()["message"]


def test_subscribe_duplicate(mock_pool):
    mock_pool.fetchrow.return_value = {
        "subscriber_id": "s1",
        "unsubscribed_at": None,
    }
    with patch("api.newsletter.get_pool", return_value=mock_pool):
        with patch("api.newsletter.lifecycle_enabled", return_value=True):
            res = client.post(
                "/v1/newsletter/subscribe",
                json={"email": "exists@example.com", "botcheck": ""},
            )
    assert res.status_code == 201
    assert res.json()["already_subscribed"] is True


def test_unsubscribe_success(mock_pool):
    mock_pool.fetchrow = AsyncMock(
        return_value={"email": "user@example.com"}
    )
    with patch("api.newsletter.get_pool", return_value=mock_pool):
        res = client.get(
            "/v1/newsletter/unsubscribe",
            params={"token": "a" * 32},
        )
    assert res.status_code == 200
    assert res.json()["message"] == "You have been unsubscribed."


def test_unsubscribe_invalid_token():
    res = client.get("/v1/newsletter/unsubscribe", params={"token": "short"})
    assert res.status_code == 400


def test_subscribe_rate_limit():
    import time

    with patch("api.newsletter.lifecycle_enabled", return_value=True):
        with patch("api.newsletter.get_pool") as mock_get_pool:
            pool = MagicMock()
            pool.fetchrow = AsyncMock(return_value=None)
            pool.execute = AsyncMock()
            mock_get_pool.return_value = pool
            now = time.time()
            with patch("api.newsletter._client_ip", return_value="1.2.3.4"):
                with patch("api.newsletter._rate", {"1.2.3.4": [now] * 10}):
                    res = client.post(
                        "/v1/newsletter/subscribe",
                        json={"email": "rate@example.com", "botcheck": ""},
                    )
    assert res.status_code == 429
