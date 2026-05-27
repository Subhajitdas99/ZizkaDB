import httpx
import json
import logging

from db.connection import get_redis
from services.embedding_config import (
    EMBEDDING_MODELS,
    TenantEmbeddingConfig,
    VECTOR_SIZE,
    get_tenant_embedding_config,
)

logger = logging.getLogger(__name__)

CACHE_TTL = 86400  # 24 hours


async def generate_embedding(text: str, tenant_id: str) -> list[float] | None:
    """Generate embedding using the tenant's configured provider/model."""
    config = await get_tenant_embedding_config(tenant_id)
    return await generate_embedding_with_config(text, config)


async def generate_embedding_with_config(
    text: str,
    config: TenantEmbeddingConfig,
) -> list[float] | None:
    if not config.api_key:
        logger.warning(
            "No embedding API key for tenant %s (platform=%s)",
            config.tenant_id,
            config.use_platform_key,
        )
        return None

    cache_key = f"emb:{config.provider}:{config.model}:{hash(text)}"
    try:
        redis = get_redis()
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass

    try:
        if config.provider == "openai":
            embedding = await _openai_embedding(text, config)
        else:
            logger.warning("Unsupported embedding provider: %s", config.provider)
            return None

        if not embedding:
            return None
        if len(embedding) != VECTOR_SIZE:
            logger.warning(
                "Embedding dimension %s != %s for tenant %s",
                len(embedding),
                VECTOR_SIZE,
                config.tenant_id,
            )
            return None

        try:
            redis = get_redis()
            await redis.setex(cache_key, CACHE_TTL, json.dumps(embedding))
        except Exception:
            pass

        return embedding
    except Exception as e:
        logger.warning("Embedding generation failed for tenant %s: %s", config.tenant_id, e)
        return None


async def _openai_embedding(text: str, config: TenantEmbeddingConfig) -> list[float] | None:
    payload: dict = {"input": text, "model": config.model}
    for m in EMBEDDING_MODELS.get("openai", []):
        if m["id"] == config.model and m.get("dimensions_param"):
            payload["dimensions"] = m["dimensions_param"]
            break

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/embeddings",
            headers={"Authorization": f"Bearer {config.api_key}"},
            json=payload,
        )
        response.raise_for_status()
        return response.json()["data"][0]["embedding"]


def event_to_text(event_type: str, data: dict) -> str:
    """Convert an event to a text representation for embedding."""
    parts = [f"event_type:{event_type}"]
    for key, value in data.items():
        if isinstance(value, str):
            parts.append(f"{key}:{value}")
        elif isinstance(value, (int, float, bool)):
            parts.append(f"{key}:{value}")
    return " ".join(parts)
