"""Shared pytest fixtures for ZizkaDB core tests."""

import os
import uuid

import httpx
import pytest

API_BASE = os.getenv("ZIZKADB_TEST_URL", "http://localhost:8000")
DEV_KEY = os.getenv("DEV_API_KEY", "zizkadb_dev_local")


def _stack_reachable() -> bool:
    try:
        r = httpx.get(f"{API_BASE}/health", timeout=3.0)
        return r.status_code == 200
    except Exception:
        return False


@pytest.fixture(scope="session")
def api_base() -> str:
    return API_BASE.rstrip("/")


@pytest.fixture(scope="session")
def dev_key() -> str:
    return DEV_KEY


@pytest.fixture
def dev_headers(dev_key: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {dev_key}",
        "Content-Type": "application/json",
    }


@pytest.fixture
async def jwt_headers(api_base: str) -> dict[str, str]:
    async with httpx.AsyncClient(base_url=api_base, timeout=10.0) as client:
        r = await client.post("/v1/auth/dev-token")
        if r.status_code != 200:
            pytest.skip(f"dev-token unavailable ({r.status_code}) — is ENV=development?")
        token = r.json()["access_token"]
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


@pytest.fixture
def unique_agent() -> str:
    return f"test-agent-{uuid.uuid4().hex[:10]}"


@pytest.fixture
async def api_client(api_base: str):
    async with httpx.AsyncClient(base_url=api_base, timeout=15.0) as client:
        yield client


def pytest_runtest_setup(item):
    """Skip integration tests when stack is not running."""
    if item.get_closest_marker("integration") and not _stack_reachable():
        pytest.skip(
            f"ZizkaDB stack not reachable at {API_BASE} — run: bash scripts/setup-local.sh"
        )
