import base64
import hashlib
import hmac
import os
from typing import Optional


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return base64.b64encode(salt + dk).decode("utf-8")


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        decoded = base64.b64decode(stored_hash.encode("utf-8"))
        salt = decoded[:16]
        stored_dk = decoded[16:]
        new_dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
        return hmac.compare_digest(new_dk, stored_dk)
    except Exception:
        return False


def parse_user_id(raw_user_id: Optional[str]) -> Optional[int]:
    if raw_user_id is None:
        return None
    try:
        return int(raw_user_id)
    except (ValueError, TypeError):
        return None
