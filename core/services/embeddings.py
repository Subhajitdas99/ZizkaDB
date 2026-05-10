import httpx
import os
import json
import logging
from db.connection import get_redis

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536
CACHE_TTL = 86400  # 24 hours


async def generate_embedding(text: str) -> list[float] | None:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    # Check cache first
    cache_key = f"emb:{hash(text)}"
    try:
        redis = get_redis()
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/embeddings",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"input": text, "model": EMBEDDING_MODEL},
            )
            response.raise_for_status()
            embedding = response.json()["data"][0]["embedding"]

            # Cache it
            try:
                await redis.setex(cache_key, CACHE_TTL, json.dumps(embedding))
            except Exception:
                pass

            return embedding
    except Exception as e:
        logger.warning(f"Embedding generation failed: {e}")
        return None


def event_to_text(event_type: str, data: dict) -> str:
    """Convert an event to a text representation for embedding."""
    parts = [f"event_type:{event_type}"]
    for key, value in data.items():
        if isinstance(value, str):
            parts.append(f"{key}:{value}")
        elif isinstance(value, (int, float, bool)):
            parts.append(f"{key}:{value}")
    return " ".join(parts)
