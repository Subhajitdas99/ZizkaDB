"""
GET /v1/stats — public social-proof counters.
No auth required. Returns user counts with a floor of 50 per category.
"""

from fastapi import APIRouter
from db.connection import get_pool
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

FLOOR = 50  # minimum shown per category regardless of real count


@router.get("")
async def get_stats():
    try:
        pool = get_pool()

        managed = await pool.fetchval("SELECT COUNT(*) FROM users")
        python_sdk = await pool.fetchval(
            "SELECT COUNT(DISTINCT install_id) FROM sdk_telemetry WHERE sdk = 'python'"
        )
        ts_sdk = await pool.fetchval(
            "SELECT COUNT(DISTINCT install_id) FROM sdk_telemetry WHERE sdk = 'typescript'"
        )
        mcp = await pool.fetchval(
            "SELECT COUNT(DISTINCT install_id) FROM sdk_telemetry WHERE sdk = 'mcp'"
        )

        return {
            "managed":    max(int(managed   or 0), 0) + FLOOR,
            "python_sdk": max(int(python_sdk or 0), 0) + FLOOR,
            "npm_sdk":    max(int(ts_sdk     or 0), 0) + FLOOR,
            "mcp":        max(int(mcp        or 0), 0) + FLOOR,
        }
    except Exception as e:
        logger.warning(f"Stats query failed: {e}")
        # Never break the homepage — return floors
        return {"managed": FLOOR, "python_sdk": FLOOR, "npm_sdk": FLOOR, "mcp": FLOOR}
