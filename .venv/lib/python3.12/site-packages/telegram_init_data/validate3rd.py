"""
3rd party validation functionality.

Contains functions for validating init data using bot ID instead of token.
"""

import time
from datetime import datetime
from urllib.parse import parse_qsl
from typing import Dict, Any, Union, Callable

from .types import ValidateValue, Validate3rdOptions
from .exceptions import (
    SignatureMissingError,
    AuthDateInvalidError,
    ExpiredError,
    SignatureInvalidError,
)


def validate3rd(
    value: ValidateValue,
    bot_id: int,
    verify_fn: Callable[[str, str, str], bool],
    options: Validate3rdOptions = None
) -> None:
    """
    Validate Telegram Mini App init data using 3rd party verification.
    
    This function validates init data using a bot ID and a custom verification
    function instead of the bot token.
    
    Args:
        value: Init data to validate (string or dict)
        bot_id: Bot ID for verification
        verify_fn: Function that verifies the signature
        options: Validation options (expires_in, test, etc.)
        
    Raises:
        SignatureMissingError: When signature parameter is missing
        AuthDateInvalidError: When auth_date is invalid or missing
        ExpiredError: When init data has expired
        SignatureInvalidError: When signature verification fails
        
    Example:
        >>> def verify(data, public_key, signature):
        ...     # Custom verification logic
        ...     return True
        >>> validate3rd("signature=abc123&auth_date=1234567890&query_id=123", 123456, verify)
    """
    if options is None:
        options = {}
    
    # Parse init data if it's a string
    if isinstance(value, str):
        init_data_dict = dict(parse_qsl(value, strict_parsing=True))
    else:
        init_data_dict = dict(value)
    
    # Extract signature from init data
    signature = init_data_dict.pop("signature", None)
    if not signature:
        raise SignatureMissingError(third_party=True)
    
    # Remove hash if present (not used in 3rd party validation)
    init_data_dict.pop("hash", None)
    
    # Validate auth_date
    auth_date_str = init_data_dict.get("auth_date")
    if not auth_date_str or not str(auth_date_str).isdigit():
        raise AuthDateInvalidError(auth_date_str)
    
    auth_date = int(auth_date_str)
    auth_date_datetime = datetime.fromtimestamp(auth_date)
    
    # Check expiration
    expires_in = options.get("expires_in", 86400)  # Default 24 hours
    if expires_in > 0:
        now_ts = int(time.time())
        expires_at_ts = auth_date + expires_in
        
        if expires_at_ts < now_ts:
            raise ExpiredError(
                issued_at=auth_date_datetime,
                expires_at=datetime.fromtimestamp(expires_at_ts),
                now=datetime.fromtimestamp(now_ts)
            )
    
    # Create verification string
    pairs = [f"{key}={value}" for key, value in sorted(init_data_dict.items())]
    verification_string = f"{bot_id}:WebAppData\n" + "\n".join(pairs)
    
    # Use test public key if in test mode
    public_key = (
        "40055058a4ee38156a06562e52eece92a771bcd8346a8c4615cb7376eddf72ec"
        if options.get("test", False)
        else "e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d"
    )
    
    # Verify signature
    if not verify_fn(verification_string, public_key, signature):
        raise SignatureInvalidError("3rd party signature verification failed") 