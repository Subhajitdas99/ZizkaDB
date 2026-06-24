"""Integration tests — event logging, query, causality (C1, C2, C4, C5, D1, D7, D9)."""

import httpx
import pytest


async def _log(
    client: httpx.AsyncClient,
    headers: dict,
    agent: str,
    event: str,
    data: dict,
    parent_id: str | None = None,
    session_id: str | None = None,
) -> dict:
    body: dict = {"agent": agent, "event": event, "data": data}
    if parent_id:
        body["parent_id"] = parent_id
    if session_id:
        body["session_id"] = session_id
    r = await client.post("/v1/events", headers=headers, json=body)
    assert r.status_code == 201, r.text
    return r.json()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_log_event_returns_ids(
    api_client: httpx.AsyncClient,
    dev_headers: dict,
    unique_agent: str,
):
    """C1, C5 — minimal log returns event_id, checksum, sequence_no."""
    body = await _log(
        api_client, dev_headers, unique_agent, "test_event", {"ok": True},
    )
    assert "event_id" in body
    assert "checksum" in body
    assert len(body["checksum"]) == 64
    assert body["sequence_no"] >= 1


@pytest.mark.integration
@pytest.mark.asyncio
async def test_causal_chain_why(
    api_client: httpx.AsyncClient,
    dev_headers: dict,
    unique_agent: str,
):
    """C2 — three linked events produce why chain length 3."""
    a = await _log(
        api_client, dev_headers, unique_agent, "user_message", {"text": "hello"},
    )
    b = await _log(
        api_client, dev_headers, unique_agent, "llm_response", {"tokens": 10},
        parent_id=a["event_id"],
    )
    c = await _log(
        api_client, dev_headers, unique_agent, "tool_call", {"tool": "search"},
        parent_id=b["event_id"],
    )

    r = await api_client.get(
        f"/v1/events/{c['event_id']}/why",
        headers=dev_headers,
        params={"depth": 10},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["chain_length"] == 3
    assert len(data["chain"]) == 3


@pytest.mark.integration
@pytest.mark.asyncio
async def test_agent_auto_created_on_log(
    api_client: httpx.AsyncClient,
    dev_headers: dict,
    unique_agent: str,
):
    """C4 — new agent name appears in fleet list after log."""
    await _log(api_client, dev_headers, unique_agent, "first", {})

    r = await api_client.get("/v1/agents", headers=dev_headers)
    assert r.status_code == 200
    agents = {a["agent"] for a in r.json()}
    assert unique_agent in agents


@pytest.mark.integration
@pytest.mark.asyncio
async def test_query_events_by_agent(
    api_client: httpx.AsyncClient,
    dev_headers: dict,
    unique_agent: str,
):
    """D1 — GET /v1/events returns logged events."""
    await _log(api_client, dev_headers, unique_agent, "query_test", {"n": 1})

    r = await api_client.get(
        "/v1/events",
        headers=dev_headers,
        params={"agent": unique_agent, "limit": 10},
    )
    assert r.status_code == 200
    events = r.json()
    assert len(events) >= 1
    assert events[0]["agent"] == unique_agent


@pytest.mark.integration
@pytest.mark.asyncio
async def test_time_travel_at(
    api_client: httpx.AsyncClient,
    dev_headers: dict,
    unique_agent: str,
):
    """D9 — state reconstruction includes last event."""
    logged = await _log(
        api_client, dev_headers, unique_agent, "state_probe", {"v": 42},
    )

    r = await api_client.get(
        "/v1/events/at",
        headers=dev_headers,
        params={"agent": unique_agent, "timestamp": logged["timestamp"]},
    )
    assert r.status_code == 200
    state = r.json()
    assert state["event_count"] >= 1
    assert state["state"].get("_last_event", {}).get("type") == "state_probe"
