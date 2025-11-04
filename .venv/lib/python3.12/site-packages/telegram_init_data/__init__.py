"""
Telegram Init Data Python Library

A Python library for working with Telegram Mini Apps initialization data.
Provides utilities to parse, validate, and sign init data on the server side.
"""

from .exceptions import (
    TelegramInitDataError,
    AuthDateInvalidError,
    SignatureInvalidError,
    SignatureMissingError,
    ExpiredError,
)
from .types import InitData, User, Chat, ChatType
from .hash_token import hash_token
from .sign_data import sign_data
from .validate import validate
from .is_valid import is_valid
from .parse import parse
from .sign import sign
from .validate3rd import validate3rd
from .is_valid3rd import is_valid3rd

# FastAPI integration (optional)
try:
    from .fastapi import (
        TelegramInitDataAuth,
        TelegramInitDataBearer,
        create_init_data_dependency,
        create_optional_init_data_dependency,
        get_telegram_auth,
    )
    _fastapi_available = True
except ImportError:
    _fastapi_available = False

__version__ = "1.0.0"
__all__ = [
    # Exceptions
    "TelegramInitDataError",
    "AuthDateInvalidError",
    "SignatureInvalidError",
    "SignatureMissingError",
    "ExpiredError",
    # Types
    "InitData",
    "User",
    "Chat",
    "ChatType",
    # Functions
    "hash_token",
    "sign_data",
    "validate",
    "is_valid",
    "parse",
    "sign",
    "validate3rd",
    "is_valid3rd",
]

# Add FastAPI components to __all__ if available
if _fastapi_available:
    __all__.extend([
        "TelegramInitDataAuth",
        "TelegramInitDataBearer",
        "create_init_data_dependency",
        "create_optional_init_data_dependency",
        "get_telegram_auth",
    ]) 