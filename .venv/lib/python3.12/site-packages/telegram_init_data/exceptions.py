"""
Telegram Init Data exceptions.

Contains custom exception classes for validation errors.
"""

from datetime import datetime
from typing import Optional


class TelegramInitDataError(Exception):
    """Base class for all Telegram Init Data errors."""
    pass


class AuthDateInvalidError(TelegramInitDataError):
    """Raised when auth_date is invalid or missing."""
    
    def __init__(self, value: Optional[str] = None):
        self.value = value
        message = f'"auth_date" is invalid: {value or "value is missing"}'
        super().__init__(message)


class SignatureInvalidError(TelegramInitDataError):
    """Raised when signature verification fails."""
    
    def __init__(self, message: str = "Signature is invalid"):
        super().__init__(message)


class SignatureMissingError(TelegramInitDataError):
    """Raised when required signature parameter is missing."""
    
    def __init__(self, third_party: bool = False):
        self.third_party = third_party
        param_name = "signature" if third_party else "hash"
        message = f'"{param_name}" parameter is missing'
        super().__init__(message)


class ExpiredError(TelegramInitDataError):
    """Raised when init data has expired."""
    
    def __init__(self, issued_at: datetime, expires_at: datetime, now: datetime):
        self.issued_at = issued_at
        self.expires_at = expires_at
        self.now = now
        message = (
            f"Init data expired. Issued at {issued_at.isoformat()}, "
            f"expires at {expires_at.isoformat()}, "
            f"now is {now.isoformat()}"
        )
        super().__init__(message) 