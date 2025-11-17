from __future__ import annotations
import base64, hashlib, hmac, json, time

# Функция для кодирования данных в формат base64 URL-safe (с исключением символов, которые могут быть не безопасными в URL)
def _b64url(data: bytes) -> str:
    # Кодируем данные в base64, затем убираем символы '=' в конце, чтобы результат стал безопасным для URL
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

# Функция для декодирования base64 URL-safe строки обратно в байты
def _b64url_dec(s: str) -> bytes:
    # Добавляем символы '=' в конце строки, если они отсутствуют, для корректного декодирования
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))

# Функция для кодирования JWT
def encode(payload: dict, secret: str, exp_seconds: int = 7*24*3600) -> str:
    # Заголовок JWT (алгоритм HS256 и тип JWT)
    header = {"alg": "HS256", "typ": "JWT"}
    
    # Добавляем в полезную нагрузку (payload) время истечения токена (по умолчанию 7 дней)
    p = dict(payload); p["exp"] = int(time.time()) + exp_seconds
    
    # Кодируем заголовок в base64
    h = _b64url(json.dumps(header, separators=(",", ":")).encode())
    
    # Кодируем полезную нагрузку (payload) в base64
    b = _b64url(json.dumps(p, separators=(",", ":")).encode())
    
    # Создаем подпись с использованием HMAC и алгоритма SHA256
    sig = hmac.new(secret.encode(), f"{h}.{b}".encode(), hashlib.sha256).digest()
    
    # Возвращаем итоговый JWT в формате: "header.payload.signature"
    return f"{h}.{b}.{_b64url(sig)}"

# Функция для декодирования и проверки JWT
def decode(token: str, secret: str) -> dict:
    # Разделяем токен на 3 части: заголовок (h), полезную нагрузку (b) и подпись (s)
    h, b, s = token.split(".")
    
    # Воссоздаем ожидаемую подпись с использованием HMAC и алгоритма SHA256
    expected = hmac.new(secret.encode(), f"{h}.{b}".encode(), hashlib.sha256).digest()
    
    # Сравниваем подпись из токена с ожидаемой подписью
    if not hmac.compare_digest(expected, _b64url_dec(s)):
        raise ValueError("invalid signature")
    
    # Декодируем полезную нагрузку (payload) из base64
    payload = json.loads(_b64url_dec(b))
    
    # Проверяем, не истек ли срок действия токена
    if int(time.time()) > int(payload.get("exp", 0)):
        raise ValueError("token expired")
    
    # Возвращаем полезную нагрузку (payload)
    return payload
