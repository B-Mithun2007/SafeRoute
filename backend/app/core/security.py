"""Cryptographic security utilities for password hashing and JWT issuance/validation."""

import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Optional

import bcrypt
import jwt
from dotenv import load_dotenv

# Ensure backend/.env is loaded without overriding existing OS environment variables
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BACKEND_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=False)

# Documented development fallback secret (minimum 32 bytes for HS256)
DEV_DEFAULT_SECRET = "saferoute-ai-dev-secret-key-minimum-32-bytes-secure!"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def get_jwt_secret() -> str:
    """Retrieves and validates the JWT signing secret.

    - Reads from JWT_SECRET_KEY environment variable.
    - When ENVIRONMENT=production, strictly enforces a non-default secret of at least 32 characters.
    - In development/testing, falls back to a documented fallback key.
    - Never logs or exposes the secret.
    """
    secret = os.getenv("JWT_SECRET_KEY")
    environment = os.getenv("ENVIRONMENT", "development").lower()

    if environment == "production":
        if not secret or secret == DEV_DEFAULT_SECRET or len(secret) < 32:
            raise RuntimeError(
                "CRITICAL SECURITY CONFIGURATION ERROR: A secure JWT_SECRET_KEY of at least "
                "32 characters must be set in the environment when running in production."
            )
        return secret

    # Development / Testing fallback
    return secret or DEV_DEFAULT_SECRET


def hash_password(password: str) -> str:
    """Hashes a plain-text password using bcrypt with automatic salt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed_bytes = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_bytes.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Encodes a JWT access token containing the provided claims."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": now})
    secret = get_jwt_secret()
    encoded_jwt = jwt.encode(to_encode, secret, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT access token.

    Validates:
      - Token formatting
      - Signature using the configured secret and HS256 algorithm
      - Expiration timestamp (exp claim)

    Returns:
      Dict[str, Any]: Decoded payload claims if valid.

    Raises:
      jwt.ExpiredSignatureError: If the token has expired.
      jwt.InvalidTokenError: If the signature or token is invalid.
    """
    secret = get_jwt_secret()
    return jwt.decode(token, secret, algorithms=[ALGORITHM])


def validate_token(token: str) -> Optional[Dict[str, Any]]:
    """Safely validates a token, returning the payload if valid or None if invalid/expired.

    Non-throwing helper suitable for optional or conditional authentication checks.
    """
    try:
        return decode_access_token(token)
    except jwt.PyJWTError:
        return None
