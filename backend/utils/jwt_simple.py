from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_dec(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def encode(payload: dict, secret: str, exp_seconds: int = 7 * 24 * 3600) -> str:
    header = {"alg": "HS256", "typ": "JWT"}

    p = dict(payload)
    p["exp"] = int(time.time()) + exp_seconds

    h = _b64url(json.dumps(header, separators=(",", ":")).encode())
    b = _b64url(json.dumps(p, separators=(",", ":")).encode())

    sig = hmac.new(secret.encode(), f"{h}.{b}".encode(), hashlib.sha256).digest()

    return f"{h}.{b}.{_b64url(sig)}"


def decode(token: str, secret: str) -> dict:
    h, b, s = token.split(".")

    expected = hmac.new(secret.encode(), f"{h}.{b}".encode(), hashlib.sha256).digest()

    if not hmac.compare_digest(expected, _b64url_dec(s)):
        raise ValueError("invalid signature")

    payload = json.loads(_b64url_dec(b))

    if int(time.time()) > int(payload.get("exp", 0)):
        raise ValueError("token expired")

    return payload
