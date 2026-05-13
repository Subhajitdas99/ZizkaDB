import os
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, EmailStr
from services.auth import request_otp, verify_otp, generate_api_key, _issue_tokens
from api.deps import get_tenant
from fastapi import Depends
from db.connection import get_pool

router = APIRouter()

_rate_limit: dict[str, int] = {}

_DEV_TENANT_ID = "00000000-0000-0000-0000-000000000001"
_DEV_USER_ID   = "00000000-0000-0000-0000-000000000001"
_DEV_EMAIL     = "dev@localhost"


class RequestOTPBody(BaseModel):
    email: EmailStr


class VerifyOTPBody(BaseModel):
    email: EmailStr
    otp: str


class CreateAPIKeyBody(BaseModel):
    name: str | None = None


@router.post("/request-otp")
async def request_otp_route(body: RequestOTPBody):
    import logging
    log = logging.getLogger(__name__)

    key = body.email.lower()
    _rate_limit[key] = _rate_limit.get(key, 0) + 1
    if _rate_limit[key] > 3:
        raise HTTPException(status_code=429, detail="Too many requests")

    try:
        await request_otp(body.email)
        return {"message": "Code sent"}
    except Exception as e:
        log.error(f"request_otp failed for {body.email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to send code. Check server logs.")


@router.post("/verify-otp")
async def verify_otp_route(body: VerifyOTPBody, response: Response):
    try:
        tokens = await verify_otp(body.email, body.otp)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=30 * 24 * 60 * 60,
        path="/",
    )

    return {"access_token": tokens["access_token"], "token_type": "bearer"}


@router.post("/api-keys")
async def create_api_key(
    body: CreateAPIKeyBody,
    tenant: dict = Depends(get_tenant),
):
    raw_key, key_hash, prefix = generate_api_key()
    pool = get_pool()

    await pool.execute(
        """
        INSERT INTO api_keys (tenant_id, key_hash, key_prefix, name)
        VALUES ($1, $2, $3, $4)
        """,
        tenant["tenant_id"], key_hash, prefix, body.name,
    )

    return {
        "key": raw_key,  # shown once only
        "prefix": prefix,
        "name": body.name,
        "warning": "Save this key — it will not be shown again.",
    }


@router.post("/dev-token")
async def dev_token_route():
    """
    Only works when ENV=development (self-hosted local mode).
    Issues a real JWT for a fixed local dev user so the dashboard
    is accessible without email / signup.
    """
    if os.getenv("ENV", "development") != "development":
        raise HTTPException(status_code=403, detail="Not available in production")

    pool = get_pool()
    await _ensure_dev_tenant(pool)
    tokens = _issue_tokens(_DEV_USER_ID, _DEV_EMAIL, _DEV_TENANT_ID)
    return {"access_token": tokens["access_token"], "token_type": "bearer"}


async def _ensure_dev_tenant(pool) -> None:
    """Idempotently create the dev tenant + user rows if they don't exist."""
    await pool.execute(
        """
        INSERT INTO tenants (tenant_id, name)
        VALUES ($1::uuid, 'Local Dev')
        ON CONFLICT (tenant_id) DO NOTHING
        """,
        _DEV_TENANT_ID,
    )
    await pool.execute(
        """
        INSERT INTO users (user_id, email, tenant_id, last_login)
        VALUES ($1::uuid, $2::text, $3::uuid, NOW())
        ON CONFLICT (email) DO UPDATE SET last_login = NOW()
        """,
        _DEV_USER_ID, _DEV_EMAIL, _DEV_TENANT_ID,
    )


@router.get("/api-keys")
async def list_api_keys(tenant: dict = Depends(get_tenant)):
    pool = get_pool()
    rows = await pool.fetch(
        """
        SELECT key_id, key_prefix, name, created_at, last_used
        FROM api_keys
        WHERE tenant_id = $1 AND revoked = FALSE
        ORDER BY created_at DESC
        """,
        tenant["tenant_id"],
    )
    return [
        {
            "key_id": str(r["key_id"]),
            "prefix": r["key_prefix"],
            "name": r["name"],
            "created_at": r["created_at"].isoformat(),
            "last_used": r["last_used"].isoformat() if r["last_used"] else None,
        }
        for r in rows
    ]
