"""
Init data validation (boolean result).

Contains the is_valid function for checking init data validity without exceptions.
"""

from .types import ValidateValue, ValidateOptions, Text
from .validate import validate
from .exceptions import TelegramInitDataError


def is_valid(
    value: ValidateValue,
    token: Text,
    options: ValidateOptions = None
) -> bool:
    """
    Check if Telegram Mini App init data is valid.
    
    This function validates init data and returns True if valid,
    False otherwise. Unlike validate(), it doesn't raise exceptions.
    
    Args:
        value: Init data to validate (string or dict)
        token: Bot token for signature verification
        options: Validation options (expires_in, etc.)
        
    Returns:
        bool: True if init data is valid, False otherwise
        
    Example:
        >>> is_valid("query_id=123&user=%7B%22id%22%3A1%7D&auth_date=1234567890&hash=abc123", "bot_token")
        True
        >>> is_valid("invalid_data", "bot_token")
        False
    """
    try:
        validate(value, token, options)
        return True
    except TelegramInitDataError:
        return False
    except Exception:
        # Catch any other unexpected errors
        return False 