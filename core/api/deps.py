from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from services.auth import verify_api_key, decode_access_token

bearer = HTTPBearer()


async def get_tenant(
    credentials: HTTPAuthorizationCredentials = Security(bearer),
) -> dict:
    """Validate API key or JWT and return tenant context."""
    token = credentials.credentials

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
