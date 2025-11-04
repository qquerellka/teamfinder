"""
Init data validation functionality.

Contains the validate function for verifying Telegram Mini App init data.
"""

import time
from datetime import datetime
from urllib.parse import parse_qsl
from typing import Dict, Any

from .types import ValidateValue, ValidateOptions, Text
from .exceptions import (
    SignatureMissingError,
    AuthDateInvalidError,
    ExpiredError,
    SignatureInvalidError,
)
from .sign_data import sign_data


def validate(
    value: ValidateValue,
    token: Text,
    options: ValidateOptions = None
) -> None:
    """
    Validate Telegram Mini App init data.
    
    This function validates the signature and expiration of init data
    received from Telegram Mini App.
    
    Args:
        value: Init data to validate (string or dict)
        token: Bot token for signature verification
        options: Validation options (expires_in, etc.)
        
    Raises:
        SignatureMissingError: When hash parameter is missing
        AuthDateInvalidError: When auth_date is invalid or missing
        ExpiredError: When init data has expired
        SignatureInvalidError: When signature verification fails
        
    Example:
        >>> validate("query_id=123&user=%7B%22id%22%3A1%7D&auth_date=1234567890&hash=abc123", "bot_token")
        # Raises exception if validation fails, otherwise returns None
    """
    if options is None:
        options = {}
    
    # Parse init data if it's a string
    if isinstance(value, str):
        init_data_dict = dict(parse_qsl(value, strict_parsing=True))
    else:
        init_data_dict = dict(value)
    
    # Extract hash from init data
    received_hash = init_data_dict.pop("hash", None)
    if not received_hash:
        raise SignatureMissingError(third_party=False)
    
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
    
    # Create check string from sorted key-value pairs
    pairs = [f"{key}={value}" for key, value in sorted(init_data_dict.items())]
    check_string = "\n".join(pairs)
    
    # Calculate expected hash
    expected_hash = sign_data(check_string, token)
    
    # Verify signature
    if expected_hash != received_hash:
        raise SignatureInvalidError(
            f"Invalid signature. Expected: {expected_hash}, received: {received_hash}"
        ) 