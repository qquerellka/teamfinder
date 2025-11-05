"""
3rd party validation (boolean result).

Contains the is_valid3rd function for checking 3rd party init data validity without exceptions.
"""

from typing import Callable

from .types import ValidateValue, Validate3rdOptions
from .validate3rd import validate3rd
from .exceptions import TelegramInitDataError


def is_valid3rd(
    value: ValidateValue,
    bot_id: int,
    verify_fn: Callable[[str, str, str], bool],
    options: Validate3rdOptions = None
) -> bool:
    """
    Check if Telegram Mini App init data is valid using 3rd party verification.
    
    This function validates init data using a bot ID and a custom verification
    function, returning True if valid, False otherwise.
    
    Args:
        value: Init data to validate (string or dict)
        bot_id: Bot ID for verification
        verify_fn: Function that verifies the signature
        options: Validation options (expires_in, test, etc.)
        
    Returns:
        bool: True if init data is valid, False otherwise
        
    Example:
        >>> def verify(data, public_key, signature):
        ...     # Custom verification logic
        ...     return True
        >>> is_valid3rd("signature=abc123&auth_date=1234567890&query_id=123", 123456, verify)
        True
    """
    try:
        validate3rd(value, bot_id, verify_fn, options)
        return True
    except TelegramInitDataError:
        return False
    except Exception:
        # Catch any other unexpected errors
        return False 