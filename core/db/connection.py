import asyncpg
import redis.asyncio as redis
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams
import os
import logging

logger = logging.getLogger(__name__)

# Global connection holders
_pg_pool: asyncpg.Pool | None = None
_redis: redis.Redis | None = None
_qdrant: AsyncQdrantClient | None = None

QDRANT_COLLECTION = "agent_events"
VECTOR_SIZE = 1536  # OpenAI text-embedding-3-small


async def init_db():
    global _pg_pool, _redis, _qdrant

    _pg_pool = await asyncpg.create_pool(
        dsn=os.getenv("DATABASE_URL"),
        min_size=2,
        max_size=20,
    )
    logger.info("Postgres connected")

    _redis = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
    logger.info("Redis connected")

    _qdrant = AsyncQdrantClient(url=os.getenv("QDRANT_URL", "http://localhost:6333"))
    await _ensure_qdrant_collection()
    logger.info("Qdrant connected")


async def _ensure_qdrant_collection():
    collections = await _qdrant.get_collections()
    names = [c.name for c in collections.collections]

    if QDRANT_COLLECTION not in names:
        await _qdrant.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE,
            ),
        )
        logger.info(f"Qdrant collection '{QDRANT_COLLECTION}' created")


async def close_db():
    if _pg_pool:
        await _pg_pool.close()
    if _redis:
        await _redis.aclose()
    if _qdrant:
        await _qdrant.close()


def get_pool() -> asyncpg.Pool:
    if not _pg_pool:
        raise RuntimeError("Database not initialized")
    return _pg_pool


def get_redis() -> redis.Redis:
    if not _redis:
        raise RuntimeError("Redis not initialized")
    return _redis


def get_qdrant() -> AsyncQdrantClient:
    if not _qdrant:
        raise RuntimeError("Qdrant not initialized")
    return _qdrant
