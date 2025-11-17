
from __future__ import annotations
import hashlib, hmac, json, time, urllib.parse

# Исключение для обработки ошибок, связанных с некорректными данными
class InitDataError(Exception):
    ...

# Функция для создания строки данных для проверки подписи
def _data_check_string(parsed: dict[str, str]) -> str:
    # Собираем строки вида "ключ=значение" по ключам в алфавитном порядке,
    # исключая ключ "hash", который используется для проверки подписи
    parts = [f"{k}={parsed[k]}" for k in sorted(parsed.keys()) if k != "hash"]
    # Возвращаем строку, соединяя элементы через новую строку "\n"
    return "\n".join(parts)

# Функция для проверки подписи данных, полученных от Mini App (WebAppData)
def _verify_webapp(parsed: dict[str, str], bot_token: str) -> bool:
    """
    Проверка подписи для данных от Telegram Mini App:
      secret = HMAC_SHA256(key="WebAppData", msg=bot_token)
      expected = HMAC_SHA256(key=secret, msg=data_check_string)
    """
    # Создаём строку данных для проверки подписи
    dcs = _data_check_string(parsed)
    # Генерируем секрет с помощью HMAC и bot_token
    secret = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
    # Вычисляем ожидаемую подпись, используя этот секрет
    calc = hmac.new(secret, dcs.encode("utf-8"), hashlib.sha256).hexdigest()
    # Сравниваем вычисленную подпись с той, что пришла в данных (parsed["hash"])
    return hmac.compare_digest(calc, parsed["hash"])

# Функция для проверки подписи, если данные пришли из Login Widget
def _verify_login(parsed: dict[str, str], bot_token: str) -> bool:
    """
    Резервный механизм для проверки подписи в случае использования Login Widget:
      secret = SHA256(bot_token)
      expected = HMAC_SHA256(key=secret, msg=data_check_string)
    """
    # Создаём строку данных для проверки подписи
    dcs = _data_check_string(parsed)
    # Генерируем секрет с использованием SHA256 от bot_token
    secret = hashlib.sha256(bot_token.encode("utf-8")).digest()
    # Вычисляем подпись с использованием этого секрета
    calc = hmac.new(secret, dcs.encode("utf-8"), hashlib.sha256).hexdigest()
    # Сравниваем вычисленную подпись с той, что пришла в данных
    return hmac.compare_digest(calc, parsed["hash"])

# Основная функция для проверки и валидации данных от Telegram
def verify_init_data(init_data: str, bot_token: str, max_age_seconds: int = 300) -> dict:
    # Если bot_token не задан, выбрасываем ошибку
    if not bot_token:
        raise InitDataError("TELEGRAM_BOT_TOKEN is not configured")

    # Разбираем строку запроса в словарь. Значения уже URL-декодированы.
    pairs = urllib.parse.parse_qsl(init_data, keep_blank_values=True)
    parsed: dict[str, str] = {k: v for k, v in pairs}

    # Проверяем, что обязательные поля присутствуют в данных
    if "hash" not in parsed:
        raise InitDataError("missing hash")
    if "auth_date" not in parsed:
        raise InitDataError("missing auth_date")
    if "user" not in parsed:
        raise InitDataError("missing user")

    # Проверка подписи: сначала для WebAppData, затем fallback для Login Widget
    if not (_verify_webapp(parsed, bot_token) or _verify_login(parsed, bot_token)):
        raise InitDataError("invalid hash")

    # Проверяем дату аутентификации (auth_date). Делаем допуск на небольшие расхождения во времени.
    try:
        ts = int(parsed["auth_date"])
    except ValueError:
        raise InitDataError("invalid auth_date")
    if max_age_seconds and abs(int(time.time()) - ts) > max_age_seconds:
        raise InitDataError("auth_date expired")

    # Проверяем, что поле 'user' является валидным JSON-объектом
    try:
        user = json.loads(parsed["user"])
        # Проверяем, что объект user содержит ключ 'id'
        if not isinstance(user, dict) or "id" not in user:
            raise InitDataError("invalid user payload")
    except json.JSONDecodeError:
        raise InitDataError("invalid user json")

    # Возвращаем данные о пользователе и остальные поля (без подмен)
    return {"user": user, "fields": parsed}
