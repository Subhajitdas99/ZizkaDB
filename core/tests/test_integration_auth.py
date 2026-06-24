"""Integration tests — authentication and tenant isolation (B6, B7, B8, B9, B2)."""

import uuid

import httpx
import pytest


@pytest.mark.integration
@pytest.mark.security
@pytest.mark.asyncio
async def test_invalid_api_key_returns_401(api_client: httpx.AsyncClient):
    r = await api_client.post(
        "/v1/events",
        headers={
            "Authorization": "Bearer totally-invalid-key",
            "Content-Type": "application/json",
        },
        json={"agent": "x", "event": "test", "data": {}},
    )
    assert r.status_code == 401


@pytest.mark.integration
@pytest.mark.security
@pytest.mark.asyncio
async def test_agent_scoped_key_match(
    api_client: httpx.AsyncClient,
    jwt_headers: dict,
    unique_agent: str,
):
    """B6 — scoped key works for bound agent."""
    create = await api_client.post(
        "/v1/agents",
        headers=jwt_headers,
        json={"agent_id": unique_agent, "key_name": "test-scoped"},
    )
    assert create.status_code == 201, create.text
    scoped_key = create.json()["api_key"]["key"]

    r = await api_client.post(
        "/v1/events",
        headers={
            "Authorization": f"Bearer {scoped_key}",
            "Content-Type": "application/json",
        },
        json={"agent": unique_agent, "event": "scoped_ok", "data": {"ok": True}},
    )
    assert r.status_code == 201, r.text


@pytest.mark.integration
@pytest.mark.security
@pytest.mark.asyncio
async def test_agent_scoped_key_mismatch_returns_403(
    api_client: httpx.AsyncClient,
    jwt_headers: dict,
    unique_agent: str,
):
    """B7 — scoped key rejects wrong agent name."""
    create = await api_client.post(
        "/v1/agents",
        headers=jwt_headers,
        json={"agent_id": unique_agent},
    )
    assert create.status_code == 201
    scoped_key = create.json()["api_key"]["key"]

    r = await api_client.post(
        "/v1/events",
        headers={
            "Authorization": f"Bearer {scoped_key}",
            "Content-Type": "application/json",
        },
        json={"agent": "wrong-agent-name", "event": "fail", "data": {}},
    )
    assert r.status_code == 403


@pytest.mark.integration
@pytest.mark.security
@pytest.mark.asyncio
async def test_tenant_wide_key_any_agent(
    api_client: httpx.AsyncClient,
    dev_headers: dict,
    unique_agent: str,
):
    """B8 — dev/tenant-wide key logs any agent name."""
    r = await api_client.post(
        "/v1/events",
        headers=dev_headers,
        json={"agent": unique_agent, "event": "wide_ok", "data": {}},
    )
    assert r.status_code == 201


@pytest.mark.integration
@pytest.mark.security
@pytest.mark.asyncio
async def test_why_unknown_event_returns_404(
    api_client: httpx.AsyncClient,
    dev_headers: dict,
):
    """B9/D7/D8 — event not in tenant returns 404 (no cross-tenant leak)."""
    fake_id = str(uuid.uuid4())
    r = await api_client.get(
        f"/v1/events/{fake_id}/why",
        headers=dev_headers,
        params={"depth": 5},
    )
    assert r.status_code == 404


@pytest.mark.integration
@pytest.mark.asyncio
async def test_jwt_lists_agents(api_client: httpx.AsyncClient, jwt_headers: dict):
    r = await api_client.get("/v1/agents", headers=jwt_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)
