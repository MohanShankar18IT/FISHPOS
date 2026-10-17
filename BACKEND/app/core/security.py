import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Any, Optional, Union
from jose import jwt
from app.core.config import settings


def get_password_hash(password: str) -> str:
    """
    Generates a secure PBKDF2-HMAC-SHA256 salted hash compatible with all Python 3.11+ versions.
    """
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return f"pbkdf2_sha256${salt}${hashed}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies plain password against stored salted hash using constant-time comparison.
    """
    try:
        if hashed_password.startswith("pbkdf2_sha256$"):
            parts = hashed_password.split("$")
            if len(parts) != 3:
                return False
            salt = parts[1]
            original_hash = parts[2]
            computed_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
            return secrets.compare_digest(original_hash, computed_hash)
        
        # Fallback comparison
        return secrets.compare_digest(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
