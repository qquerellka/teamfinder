from __future__ import annotations

import hashlib
import hmac
import json
import time
import urllib.parse


class InitDataError(Exception): ...


def _data_check_string(parsed: dict[str, str]) -> str:
    parts = [f"{k}={parsed[k]}" for k in sorted(parsed.keys()) if k != "hash"]
    return "\n".join(parts)


def _verify_webapp(parsed: dict[str, str], bot_token: str) -> bool:
    """
    Проверка подписи для данных от Telegram Mini App:
      secret = HMAC_SHA256(key="WebAppData", msg=bot_token)
      expected = HMAC_SHA256(key=secret, msg=data_check_string)
    """
    dcs = _data_check_string(parsed)
    secret = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
    calc = hmac.new(secret, dcs.encode("utf-8"), hashlib.sha256).hexdigest()
    return hmac.compare_digest(calc, parsed["hash"])


def _verify_login(parsed: dict[str, str], bot_token: str) -> bool:
    """
    Проверка подписи для Login Widget:
      secret = SHA256(bot_token)
      expected = HMAC_SHA256(key=secret, msg=data_check_string)
    """
    dcs = _data_check_string(parsed)
    secret = hashlib.sha256(bot_token.encode("utf-8")).digest()
    calc = hmac.new(secret, dcs.encode("utf-8"), hashlib.sha256).hexdigest()
    return hmac.compare_digest(calc, parsed["hash"])


def verify_init_data(
    init_data: str,
    bot_token: str,
    max_age_seconds: int = 300,
) -> dict:
    if not bot_token:
        raise InitDataError("TELEGRAM_BOT_TOKEN is not configured")

    pairs = urllib.parse.parse_qsl(init_data, keep_blank_values=True)
    parsed: dict[str, str] = {k: v for k, v in pairs}

    if "hash" not in parsed:
        raise InitDataError("missing hash")
    if "auth_date" not in parsed:
        raise InitDataError("missing auth_date")
    if "user" not in parsed:
        raise InitDataError("missing user")

    if not (_verify_webapp(parsed, bot_token) or _verify_login(parsed, bot_token)):
        raise InitDataError("invalid hash")

    try:
        ts = int(parsed["auth_date"])
    except ValueError:
        raise InitDataError("invalid auth_date")

    if max_age_seconds and abs(int(time.time()) - ts) > max_age_seconds:
        raise InitDataError("auth_date expired")

    try:
        user = json.loads(parsed["user"])
        if not isinstance(user, dict) or "id" not in user:
            raise InitDataError("invalid user payload")
    except json.JSONDecodeError:
        raise InitDataError("invalid user json")

    return {"user": user, "fields": parsed}
