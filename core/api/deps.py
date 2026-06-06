import os
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from services.auth import verify_api_key, decode_access_token

bearer = HTTPBearer()

# Dev key: set DEV_API_KEY in .env for self-hosted local development.
# Any request with this token is accepted without a DB lookup.
# Never set this in production managed cloud.
_DEV_API_KEY = os.getenv("DEV_API_KEY", "")
_IS_PRODUCTION = os.getenv("ENV", "development") == "production"

# Same IDs as /v1/auth/dev-token (core/api/auth.py)
_DEV_TENANT_ID = "00000000-0000-0000-0000-000000000001"
_DEV_USER_ID = "00000000-0000-0000-0000-000000000001"

_DEV_TENANT = {
    "tenant_id": _DEV_TENANT_ID,
    "user_id": _DEV_USER_ID,
}


def looks_like_jwt(token: str) -> bool:
    """JWTs use three dot-separated segments; API keys do not."""
    return token.count(".") == 2


async def resolve_api_key_tenant(token: str) -> dict | None:
    """Verify API key by hash — works for all issued keys regardless of prefix."""
    if looks_like_jwt(token):
        return None
    return await verify_api_key(token)


async def get_tenant(
    credentials: HTTPAuthorizationCredentials = Security(bearer),
) -> dict:
    """Validate API key or JWT and return tenant context."""
    token = credentials.credentials

    # Dev key bypass (self-hosted local development only)
    if _DEV_API_KEY and token == _DEV_API_KEY:
        if _IS_PRODUCTION:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or revoked API key",
            )
        return _DEV_TENANT

    # API key (zizkadb_live_* — verified by hash, not prefix)
    tenant = await resolve_api_key_tenant(token)
    if tenant:
        return tenant

    # JWT (dashboard sessions)
    try:
        payload = decode_access_token(token)
        return {
            "tenant_id": payload["tenant_id"],
            "user_id": payload["sub"],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
