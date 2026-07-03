import asyncio
import hashlib
import secrets
import os
import logging
import jwt
import bcrypt
import random
from typing import Literal
from datetime import datetime, timedelta, timezone
from db.connection import get_pool
from services.billing import TRIAL_DAYS

log = logging.getLogger(__name__)

def _required_secret(env_var: str, dev_fallback: str) -> str:
    """
    Resolve a signing secret from the environment.

    In development this falls back to a fixed insecure string so local
    self-host works without any env setup. In production (ENV !=
    "development"), the fallback string is visible in this public
    repository — using it to sign JWTs would let anyone forge a valid
    auth token. Refuse to start rather than silently sign tokens with a
    known secret.
    """
    secret = os.getenv(env_var)
    if secret:
        return secret
    if os.getenv("ENV", "development") != "development":
        raise RuntimeError(
            f"{env_var} must be set in production. Refusing to sign tokens "
            f"with the hardcoded development fallback, since that value is "
            f"visible in the public source code."
        )
    return dev_fallback


JWT_SECRET = _required_secret("JWT_SECRET", "dev-secret")
JWT_REFRESH_SECRET = _required_secret("JWT_REFRESH_SECRET", "dev-refresh-secret")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
REFRESH_TOKEN_EXPIRE_DAYS = 30

_PROMO_RATE_WINDOW_SEC = 15 * 60
_PROMO_RATE_MAX = 10
_promo_rate: dict[str, list[float]] = {}


def _check_promo_rate_limit(email: str) -> None:
    """Limit promo redeem attempts per email (anti brute-force)."""
    key = email.lower().strip()
    now = datetime.now(timezone.utc).timestamp()
    window_start = now - _PROMO_RATE_WINDOW_SEC
    hits = [t for t in _promo_rate.get(key, []) if t > window_start]
    if len(hits) >= _PROMO_RATE_MAX:
        raise ValueError(
            "Too many promo attempts. Wait 15 minutes and try again."
        )
    hits.append(now)
    _promo_rate[key] = hits


# ─────────────────────────────────────────
# API KEY AUTH
# ─────────────────────────────────────────

def generate_api_key() -> tuple[str, str]:
    """Returns (raw_key, key_hash, prefix). Store hash, show raw once."""
    raw = f"zizkadb_live_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw.encode()).hexdigest()
    prefix = raw[:16]
    return raw, key_hash, prefix


async def verify_api_key(raw_key: str) -> dict | None:
    """Returns tenant info if valid, None if invalid.

    Legacy managed-cloud keys (``agdb_live_...``) and new keys
    (``zizkadb_live_...``) both authenticate the same way.
    """
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    pool = get_pool()

    row = await pool.fetchrow(
        """
        SELECT ak.tenant_id, ak.key_id, ak.agent_id, ak.revoked
        FROM api_keys ak
        WHERE ak.key_hash = $1
        """,
        key_hash,
    )

    if not row or row["revoked"]:
        return None

    # Update last_used async (fire and forget)
    await pool.execute(
        "UPDATE api_keys SET last_used = NOW() WHERE key_hash = $1",
        key_hash,
    )

    return {
        "tenant_id": str(row["tenant_id"]),
        "key_id": str(row["key_id"]),
        "agent_id": row["agent_id"],
    }


# ─────────────────────────────────────────
# PASSWORDLESS OTP AUTH
# ─────────────────────────────────────────

async def email_exists(email: str) -> bool:
    email = email.lower().strip()
    pool = get_pool()
    row = await pool.fetchval("SELECT 1 FROM users WHERE email = $1", email)
    return row is not None


async def request_otp(email: str) -> None:
    email = email.lower().strip()
    otp = str(random.randint(100000, 999999))
    otp_hash = bcrypt.hashpw(otp.encode(), bcrypt.gensalt()).decode()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    pool = get_pool()

    # Invalidate previous OTPs
    await pool.execute(
        "UPDATE auth_otps SET used = TRUE WHERE email = $1 AND used = FALSE",
        email,
    )

    await pool.execute(
        """
        INSERT INTO auth_otps (email, otp_hash, expires_at)
        VALUES ($1, $2, $3)
        """,
        email, otp_hash, expires_at,
    )

    from services.email.service import get_email_service

    try:
        await get_email_service().send_otp(email, otp)
    except Exception as e:
        log.warning("OTP email send failed for %s (code saved in DB): %s", email, e)


async def _save_signup_consent(
    *,
    db,
    user_id: str,
    consent_at: datetime,
    marketing_consent: bool,
) -> None:
    """Persist signup consents; self-heal if columns are missing."""
    try:
        await db.execute(
            """
            UPDATE users SET
                gdpr_consent_at = $2,
                marketing_consent = $3,
                marketing_consent_at = CASE WHEN $3 THEN $2 ELSE marketing_consent_at END
            WHERE user_id = $1::uuid
            """,
            user_id,
            consent_at,
            marketing_consent,
        )
        return
    except Exception as e:
        log.warning("consent update retry for user %s after schema sync: %s", user_id, e)

    # In case API started before migration touched this DB, self-heal once.
    await db.execute(
        """
        ALTER TABLE users ADD COLUMN IF NOT EXISTS gdpr_consent_at TIMESTAMPTZ;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ;
        """
    )
    await db.execute(
        """
        UPDATE users SET
            gdpr_consent_at = $2,
            marketing_consent = $3,
            marketing_consent_at = CASE WHEN $3 THEN $2 ELSE marketing_consent_at END
        WHERE user_id = $1::uuid
        """,
        user_id,
        consent_at,
        marketing_consent,
    )


AuthIntent = Literal["login", "signup"]

_LOGIN_NO_ACCOUNT = (
    "No account found for this email. Create an account to get started."
)
_SIGNUP_ALREADY_REGISTERED = (
    "This email is already registered. Please sign in instead."
)
_SIGNUP_GDPR_REQUIRED = "GDPR consent is required to create an account."


async def verify_otp(
    email: str,
    otp: str,
    *,
    intent: AuthIntent = "login",
    gdpr_consent: bool | None = None,
    marketing_consent: bool | None = None,
    promo_code: str | None = None,
) -> dict:
    email = email.lower().strip()
    pool = get_pool()

    row = await pool.fetchrow(
        """
        SELECT otp_id, otp_hash FROM auth_otps
        WHERE email = $1 AND used = FALSE AND expires_at > NOW()
        ORDER BY created_at DESC LIMIT 1
        """,
        email,
    )

    if not row:
        raise ValueError("OTP expired or not found")

    valid = bcrypt.checkpw(otp.encode(), row["otp_hash"].encode())
    if not valid:
        raise ValueError("Invalid OTP")

    user_exists = await email_exists(email)

    if intent == "login":
        if not user_exists:
            raise ValueError(_LOGIN_NO_ACCOUNT)
    elif intent == "signup":
        if user_exists:
            raise ValueError(_SIGNUP_ALREADY_REGISTERED)
        if not gdpr_consent:
            raise ValueError(_SIGNUP_GDPR_REQUIRED)
    else:
        raise ValueError("Invalid authentication intent")

    async with pool.acquire() as conn:
        async with conn.transaction():
            if intent == "login":
                user = await conn.fetchrow(
                    """
                    SELECT user_id, email, tenant_id
                    FROM users WHERE email = $1
                    """,
                    email,
                )
                if not user:
                    raise ValueError(_LOGIN_NO_ACCOUNT)

                await conn.execute(
                    "UPDATE users SET last_login = NOW() WHERE user_id = $1::uuid",
                    user["user_id"],
                )
                user_id = str(user["user_id"])
                tenant_id = user["tenant_id"]
            else:
                tenant_id = await conn.fetchval(
                    "INSERT INTO tenants (name) VALUES ($1) RETURNING tenant_id",
                    email,
                )
                user = await conn.fetchrow(
                    """
                    INSERT INTO users (email, tenant_id, last_login)
                    VALUES ($1, $2, NOW())
                    RETURNING user_id, email, tenant_id
                    """,
                    email,
                    tenant_id,
                )
                user_id = str(user["user_id"])
                consent_at = datetime.now(timezone.utc)
                try:
                    await _save_signup_consent(
                        db=conn,
                        user_id=user_id,
                        consent_at=consent_at,
                        marketing_consent=bool(marketing_consent),
                    )
                except Exception as e:
                    log.warning(
                        "consent persistence skipped for user %s: %s", user_id, e
                    )
                await conn.execute(
                    f"""
                    UPDATE users
                    SET plan = COALESCE(plan, 'pro'),
                        subscription_status = COALESCE(subscription_status, 'trialing'),
                        trial_ends_at = COALESCE(
                            trial_ends_at, NOW() + INTERVAL '{TRIAL_DAYS} days'
                        )
                    WHERE user_id = $1::uuid
                    """,
                    user_id,
                )

            # Legacy rows: user without tenant breaks /v1/agents (JWT has no valid tenant_id)
            if not tenant_id:
                tenant_id = await conn.fetchval(
                    "INSERT INTO tenants (name) VALUES ($1) RETURNING tenant_id",
                    email,
                )
                await conn.execute(
                    "UPDATE users SET tenant_id = $1::uuid WHERE user_id = $2::uuid",
                    tenant_id,
                    user_id,
                )

            tenant_id = str(tenant_id)

            burned = await conn.fetchval(
                """
                UPDATE auth_otps SET used = TRUE
                WHERE otp_id = $1 AND used = FALSE
                RETURNING otp_id
                """,
                row["otp_id"],
            )
            if not burned:
                raise ValueError("OTP already used")

    if intent == "signup":
        try:
            from services.email.newsletter_sync import sync_newsletter_on_signup

            await sync_newsletter_on_signup(
                email=email,
                marketing_consent=bool(marketing_consent),
            )
        except Exception as e:
            log.warning("newsletter sync skipped for %s: %s", user_id, e)

        if promo_code:
            _check_promo_rate_limit(email)
            from services.email.churn import redeem_churn_promo

            try:
                await redeem_churn_promo(
                    email=email,
                    promo_code=promo_code,
                    user_id=user_id,
                )
            except Exception as e:
                log.warning("promo redeem skipped for %s: %s", user_id, e)

    return {
        **_issue_tokens(user_id, email, tenant_id),
        "user_id": user_id,
        "tenant_id": tenant_id,
        "is_new_signup": intent == "signup",
    }


def _issue_tokens(user_id: str, email: str, tenant_id: str) -> dict:
    now = datetime.now(timezone.utc)

    access_token = jwt.encode(
        {
            "sub": user_id,
            "email": email,
            "tenant_id": tenant_id,
            "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            "iat": now,
        },
        JWT_SECRET,
        algorithm="HS256",
    )

    refresh_token = jwt.encode(
        {
            "sub": user_id,
            "exp": now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            "iat": now,
        },
        JWT_REFRESH_SECRET,
        algorithm="HS256",
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
