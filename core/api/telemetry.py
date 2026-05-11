"""
POST /v1/telemetry — anonymous SDK usage ping.

No auth required. Never returns errors (always 200).
Stores: install_id, sdk, sdk_version, runtime version, OS, mode, first_seen, last_seen, ping_count.
"""

from fastapi import APIRouter, Request
from pydantic import BaseModel
from db.connection import get_pool
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class TelemetryPing(BaseModel):
    install_id:  str
    sdk:         str = "unknown"
    sdk_version: str = "unknown"
    python:      str | None = None
    node:        str | None = None
    os:          str = "unknown"
    mode:        str = "cloud"   # "cloud" | "self-hosted"


@router.post("", status_code=200)
async def receive_ping(body: TelemetryPing, request: Request):
    """Accept anonymous telemetry ping. Always returns 200."""
    try:
        pool = get_pool()
        runtime = body.python or body.node or "unknown"

        await pool.execute(
            """
            INSERT INTO sdk_telemetry
                (install_id, sdk, sdk_version, runtime, os, mode)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (install_id)
            DO UPDATE SET
                last_seen   = NOW(),
                ping_count  = sdk_telemetry.ping_count + 1,
                sdk_version = EXCLUDED.sdk_version,
                mode        = EXCLUDED.mode
            """,
            body.install_id[:128],
            body.sdk[:32],
            body.sdk_version[:32],
            runtime[:64],
            body.os[:32],
            body.mode[:32],
        )
    except Exception as e:
        logger.debug(f"Telemetry insert failed (non-critical): {e}")

    return {"ok": True}
