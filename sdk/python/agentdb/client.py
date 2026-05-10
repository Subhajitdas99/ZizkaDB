"""
AgentDB Python SDK

Usage:
    from agentdb import AgentDB

    # Managed (cloud)
    db = AgentDB("agdb_live_xxxx")

    # Self-hosted
    db = AgentDB(host="http://localhost:8000")

    # Log an event
    await db.log(agent="my-bot", event="tool_call", data={"tool": "search"})

    # Why did something happen?
    chain = await db.why(event_id="...")
    chain.print()

    # Semantic search
    results = await db.search("what did the agent do about billing")

    # Time travel
    state = await db.at(agent="my-bot", timestamp=datetime(2026, 5, 1))
"""

import httpx
from datetime import datetime
from typing import Any

from .models import Event, LogResult, CausalChain, AgentState, AgentInfo
from .exceptions import AgentDBError, AuthError, NotFoundError, RateLimitError

CLOUD_HOST = "https://agentdb.zizka.ai/api"


class AgentDB:
    """
    AgentDB client.

    Args:
        api_key: Your AgentDB API key (starts with agdb_live_).
                 Get one at agentdb.zizka.ai
        host:    URL of your self-hosted instance.
                 Defaults to AgentDB Cloud if api_key is provided.
        timeout: HTTP timeout in seconds. Default 10.
    """

    def __init__(
        self,
        api_key: str | None = None,
        host: str | None = None,
        timeout: float = 10.0,
    ):
        if not api_key and not host:
            raise AgentDBError(
                "Provide an api_key (cloud) or host (self-hosted).\n"
                "  Cloud:       AgentDB('agdb_live_...')\n"
                "  Self-hosted: AgentDB(host='http://localhost:8000')"
            )

        self._api_key = api_key
        self._base_url = host.rstrip("/") if host else CLOUD_HOST
        self._timeout = timeout
        self._client: httpx.AsyncClient | None = None

    # ─────────────────────────────────────────
    # CONTEXT MANAGER
    # ─────────────────────────────────────────

    async def __aenter__(self):
        self._client = httpx.AsyncClient(
            base_url=self._base_url,
            headers=self._headers(),
            timeout=self._timeout,
        )
        return self

    async def __aexit__(self, *_):
        if self._client:
            await self._client.aclose()

    # ─────────────────────────────────────────
    # LOG — log a single event
    # ─────────────────────────────────────────

    async def log(
        self,
        agent: str,
        event: str,
        data: dict[str, Any],
        parent_id: str | None = None,
        session_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> LogResult:
        """
        Log an event.

        Args:
            agent:      Your agent's identifier (e.g. "customer-support-bot")
            event:      Event type (e.g. "tool_call", "user_message", "error")
            data:       Event payload — any dict
            parent_id:  ID of the causing event (enables causal lineage)
            session_id: Group related events into a session
            metadata:   Optional extra metadata

        Returns:
            LogResult with event_id, timestamp, sequence_no, checksum
        """
        response = await self._post(
            "/v1/events",
            {
                "agent": agent,
                "event": event,
                "data": data,
                "parent_id": parent_id,
                "session_id": session_id,
                "metadata": metadata,
            },
        )
        return LogResult.from_dict(response)

    # ─────────────────────────────────────────
    # QUERY — fetch events
    # ─────────────────────────────────────────

    async def query(
        self,
        agent: str,
        limit: int = 50,
        before: datetime | None = None,
        after: datetime | None = None,
        event_type: str | None = None,
        session_id: str | None = None,
    ) -> list[Event]:
        """
        Query events for an agent.

        Args:
            agent:      Agent identifier
            limit:      Max events to return (default 50, max 1000)
            before:     Only events before this time
            after:      Only events after this time
            event_type: Filter to a specific event type
            session_id: Filter to a specific session

        Returns:
            List of Event objects, newest first
        """
        params: dict[str, Any] = {"agent": agent, "limit": limit}
        if before:
            params["before"] = before.isoformat()
        if after:
            params["after"] = after.isoformat()
        if event_type:
            params["event_type"] = event_type
        if session_id:
            params["session_id"] = session_id

        response = await self._get("/v1/events", params)
        return [Event.from_dict(e) for e in response]

    # ─────────────────────────────────────────
    # WHY — causal chain for an event
    # ─────────────────────────────────────────

    async def why(self, event_id: str, depth: int = 10) -> CausalChain:
        """
        Get the causal chain for an event.
        Walks parent_id links to show WHY an event happened.

        Args:
            event_id: The event to explain
            depth:    How many levels up to trace (default 10)

        Returns:
            CausalChain — call .print() to display as a tree

        Example:
            chain = await db.why("evt_abc123")
            chain.print()
            # user_message: "why is my bill high?"
            #     └── tool_call: get_billing(user=123)
            #         └── agent_response: "I found an anomaly"
        """
        response = await self._get(
            f"/v1/events/{event_id}/why",
            {"depth": depth},
        )
        return CausalChain(
            event_id=response["event_id"],
            chain_length=response["chain_length"],
            chain=[Event.from_dict(e) for e in response["chain"]],
        )

    # ─────────────────────────────────────────
    # SEARCH — semantic search
    # ─────────────────────────────────────────

    async def search(
        self,
        query: str,
        agent: str | None = None,
        limit: int = 10,
    ) -> list[Event]:
        """
        Search agent history using natural language.

        Args:
            query: Natural language query
            agent: Limit search to a specific agent (optional)
            limit: Number of results (default 10)

        Returns:
            List of Events sorted by relevance score

        Example:
            results = await db.search("what happened with billing refunds")
        """
        response = await self._post(
            "/v1/search",
            {"query": query, "agent": agent, "limit": limit},
        )
        return [Event.from_dict(e) for e in response["results"]]

    # ─────────────────────────────────────────
    # AT — time travel
    # ─────────────────────────────────────────

    async def at(self, agent: str, timestamp: datetime) -> AgentState:
        """
        Reconstruct agent state at a specific point in time.

        Args:
            agent:     Agent identifier
            timestamp: Point in time to reconstruct state at

        Returns:
            AgentState with the reconstructed state dict

        Example:
            from datetime import datetime
            state = await db.at("my-bot", datetime(2026, 5, 1, 15, 0))
            print(state.state)
        """
        response = await self._get(
            "/v1/events/at",
            {"agent": agent, "timestamp": timestamp.isoformat()},
        )
        return AgentState(
            agent=response["agent"],
            at=datetime.fromisoformat(response["at"]),
            event_count=response["event_count"],
            state=response["state"],
        )

    # ─────────────────────────────────────────
    # AGENTS — list agents
    # ─────────────────────────────────────────

    async def agents(self) -> list[AgentInfo]:
        """List all agents in your project."""
        response = await self._get("/v1/agents", {})
        return [AgentInfo.from_dict(a) for a in response]

    # ─────────────────────────────────────────
    # HTTP HELPERS
    # ─────────────────────────────────────────

    def _headers(self) -> dict:
        headers = {"Content-Type": "application/json"}
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"
        return headers

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client:
            return self._client
        return httpx.AsyncClient(
            base_url=self._base_url,
            headers=self._headers(),
            timeout=self._timeout,
        )

    async def _post(self, path: str, body: dict) -> dict:
        client = await self._get_client()
        try:
            resp = await client.post(path, json=body)
            return self._handle(resp)
        finally:
            if not self._client:
                await client.aclose()

    async def _get(self, path: str, params: dict) -> Any:
        client = await self._get_client()
        try:
            resp = await client.get(path, params=params)
            return self._handle(resp)
        finally:
            if not self._client:
                await client.aclose()

    def _handle(self, resp: httpx.Response) -> Any:
        if resp.status_code == 401:
            raise AuthError(
                "Invalid API key. Check your key at agentdb.zizka.ai/settings/api-keys",
                status_code=401,
            )
        if resp.status_code == 404:
            raise NotFoundError("Resource not found", status_code=404)
        if resp.status_code == 429:
            raise RateLimitError("Rate limit exceeded", status_code=429)
        if resp.status_code >= 400:
            try:
                detail = resp.json().get("detail", resp.text)
            except Exception:
                detail = resp.text
            raise AgentDBError(
                f"AgentDB error ({resp.status_code}): {detail}",
                status_code=resp.status_code,
            )
        return resp.json()
