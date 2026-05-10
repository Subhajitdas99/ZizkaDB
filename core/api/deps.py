import os
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from services.auth import verify_api_key, decode_access_token

bearer = HTTPBearer()

# Dev key: set DEV_API_KEY in .env for self-hosted local development.
# Any request with this token is accepted without a DB lookup.
# Never set this in production.
_DEV_API_KEY = os.getenv("DEV_API_KEY", "")

_DEV_TENANT = {
    "tenant_id": "dev-tenant",
    "user_id":   "dev-user",
}


async def get_tenant(
    credentials: HTTPAuthorizationCredentials = Security(bearer),
) -> dict:
    """Validate API key or JWT and return tenant context."""
    token = credentials.credentials

    # Dev key bypass (self-hosted local development only)
    if _DEV_API_KEY and token == _DEV_API_KEY:
        return _DEV_TENANT

    # API key (starts with agdb_)
    if token.startswith("agdb_"):
        tenant = await verify_api_key(token)
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or revoked API key",
            )
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
