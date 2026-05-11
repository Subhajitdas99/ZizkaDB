import hashlib
import secrets
import os
import jwt
import bcrypt
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
from db.connection import get_pool

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET", "dev-refresh-secret")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
REFRESH_TOKEN_EXPIRE_DAYS = 30


# ─────────────────────────────────────────
# API KEY AUTH
# ─────────────────────────────────────────

def generate_api_key() -> tuple[str, str]:
    """Returns (raw_key, key_hash). Store hash, show raw once."""
    raw = f"agdb_live_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw.encode()).hexdigest()
    prefix = raw[:16]
    return raw, key_hash, prefix


async def verify_api_key(raw_key: str) -> dict | None:
    """Returns tenant info if valid, None if invalid."""
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    pool = get_pool()

    row = await pool.fetchrow(
        """
        SELECT ak.tenant_id, ak.key_id, ak.revoked
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

    return {"tenant_id": str(row["tenant_id"]), "key_id": str(row["key_id"])}


# ─────────────────────────────────────────
# PASSWORDLESS OTP AUTH
# ─────────────────────────────────────────

async def request_otp(email: str) -> None:
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

    await _send_otp_email(email, otp)


async def verify_otp(email: str, otp: str) -> dict:
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

    await pool.execute(
        "UPDATE auth_otps SET used = TRUE WHERE otp_id = $1",
        row["otp_id"],
    )

    # Upsert user + tenant — explicit ::text casts avoid asyncpg type ambiguity
    user = await pool.fetchrow(
        """
        WITH ins_tenant AS (
            INSERT INTO tenants (name)
            SELECT $1::text
            WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = $1::text)
            RETURNING tenant_id
        ),
        ins_user AS (
            INSERT INTO users (email, tenant_id, last_login)
            VALUES (
                $1::text,
                (SELECT tenant_id FROM ins_tenant),
                NOW()
            )
            ON CONFLICT (email) DO UPDATE SET last_login = NOW()
            RETURNING user_id, email, tenant_id
        )
        SELECT * FROM ins_user
        """,
        email,
    )

    return _issue_tokens(str(user["user_id"]), email, str(user["tenant_id"]))


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


# ─────────────────────────────────────────
# EMAIL
# ─────────────────────────────────────────

async def _send_otp_email(email: str, otp: str) -> None:
    # Uses the same env var names as zizka.ai (EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_FROM)
    host = os.getenv("EMAIL_HOST")
    user = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASS")

    # If SMTP is not configured, print the OTP to server logs for testing.
    if not host or not user or not password:
        print(f"\n{'='*50}")
        print(f"OTP FOR {email}: {otp}")
        print(f"(Set EMAIL_HOST / EMAIL_USER / EMAIL_PASS to send real emails)")
        print(f"{'='*50}\n", flush=True)
        return

    port = int(os.getenv("EMAIL_PORT", 587))
    from_addr = os.getenv("EMAIL_FROM", f'"AgentDB" <{user}>')
    is_ssl = port == 465

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{otp} is your AgentDB login code"
    msg["From"] = from_addr
    msg["To"] = email

    text = f"Your AgentDB login code: {otp}\n\nExpires in 15 minutes."
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:420px;margin:40px auto;padding:24px;background:#fff;border-radius:12px;">
      <p style="font-size:14px;color:#555;margin:0 0 20px">Your AgentDB login code:</p>
      <div style="font-size:38px;font-weight:700;letter-spacing:10px;
                  background:#f5f5f5;padding:24px;text-align:center;
                  border-radius:8px;color:#111;font-family:monospace">
        {otp}
      </div>
      <p style="color:#aaa;font-size:12px;margin-top:20px;line-height:1.6">
        Expires in 15 minutes.<br>
        If you did not request this, ignore this email.
      </p>
    </div>
    """

    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    if is_ssl:
        import ssl
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(host, port, context=context) as server:
            server.login(user, password)
            server.sendmail(from_addr, email, msg.as_string())
    else:
        with smtplib.SMTP(host, port) as server:
            server.starttls()
            server.login(user, password)
            server.sendmail(from_addr, email, msg.as_string())
