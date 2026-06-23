"""Integration tests — search, context, forget (E1, E11, E12)."""

import uuid

import httpx
import pytest


async def _log(
    client: httpx.AsyncClient,
    headers: dict,
    agent: str,
    data: dict,
) -> str:
    r = await client.post(
        "/v1/events",
        headers=headers,
        json={"agent": agent, "event": "forget_test", "data": data},
    )
    assert r.status_code == 201, r.text
    return r.json()["event_id"]


@pytest.mark.integration
@pytest.mark.asyncio
async def test_search_without_embeddings_returns_400(
    api_client: httpx.AsyncClient,
    dev_headers: dict,
    unique_agent: str,
):
    """E1 — semantic search fails when embeddings not configured."""
    cfg = await api_client.get("/v1/settings/embeddings", headers=dev_headers)
    if cfg.status_code == 200 and cfg.json().get("ready"):
        pytest.skip("Embeddings ready on server — E1 needs OPENAI_API_KEY unset")

    r = await api_client.post(
        "/v1/search",
        headers=dev_headers,
        json={"query": "billing refund test", "agent": unique_agent, "limit": 5},
    )
    assert r.status_code == 400


@pytest.mark.integration
@pytest.mark.asyncio
async def test_forget_deletes_matching_events(
    api_client: httpx.AsyncClient,
    dev_headers: dict,
    unique_agent: str,
):
    """E11 — GDPR forget removes events by data filter."""
    marker = f"user-{uuid.uuid4().hex[:8]}"
    await _log(api_client, dev_headers, unique_agent, {"user_id": marker})
    await _log(api_client, dev_headers, unique_agent, {"user_id": marker})

    forget = await api_client.request(
        "DELETE",
        "/v1/memory/forget",
        headers=dev_headers,
        json={"filter_key": "user_id", "filter_value": marker},
    )
    assert forget.status_code == 200
    assert forget.json()["deleted_events"] >= 2

    listed = await api_client.get(
        "/v1/events",
        headers=dev_headers,
        params={"agent": unique_agent, "limit": 100},
    )
    assert listed.status_code == 200
    for ev in listed.json():
        assert ev.get("data", {}).get("user_id") != marker


@pytest.mark.integration
@pytest.mark.asyncio
async def test_forget_no_match_returns_zero(
    api_client: httpx.AsyncClient,
    dev_headers: dict,
):
    """E12 — forget with no matches returns deleted_events 0."""
    r = await api_client.request(
        "DELETE",
        "/v1/memory/forget",
        headers=dev_headers,
        json={"filter_key": "user_id", "filter_value": f"nonexistent-{uuid.uuid4()}"},
    )
    assert r.status_code == 200
    assert r.json()["deleted_events"] == 0


@pytest.mark.integration
@pytest.mark.requires_openai
@pytest.mark.asyncio
async def test_search_with_embeddings(
    api_client: httpx.AsyncClient,
    dev_headers: dict,
    unique_agent: str,
):
    """E2 — search returns results when embeddings configured."""
    import os

    if not os.getenv("OPENAI_API_KEY"):
        pytest.skip("OPENAI_API_KEY not set")

    cfg = await api_client.get("/v1/settings/embeddings", headers=dev_headers)
    if cfg.status_code == 200 and not cfg.json().get("ready"):
        pytest.skip("Server embeddings not ready")

    await _log(
        api_client,
        dev_headers,
        unique_agent,
        {"topic": "billing refund anomaly for customer 999"},
    )

    r = await api_client.post(
        "/v1/search",
        headers=dev_headers,
        json={"query": "billing refund", "agent": unique_agent, "limit": 5},
    )
    assert r.status_code == 200
    assert "results" in r.json()
