"""
Init data signing functionality.

Contains the sign function for creating signed init data.
"""

from datetime import datetime
from urllib.parse import urlencode
from typing import Dict, Any, Optional

from .types import SignData, Text, ValidateOptions
from .sign_data import sign_data


def sign(
    data: SignData,
    token: Text,
    auth_date: datetime,
    options: ValidateOptions = None
) -> str:
    """
    Sign Telegram Mini App init data.
    
    This function creates a signed version of init data that can be
    used for testing or development purposes.
    
    Args:
        data: Init data to sign (dict)
        token: Bot token for signing
        auth_date: Authentication date
        options: Additional options (currently unused)
        
    Returns:
        str: Signed init data as URL-encoded string
        
    Example:
        >>> from datetime import datetime
        >>> data = {"query_id": "123", "user": {"id": 1, "first_name": "John"}}
        >>> sign(data, "bot_token", datetime.now())
        'auth_date=1234567890&query_id=123&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22John%22%7D&hash=abc123'
    """
    # Convert datetime to timestamp
    auth_date_timestamp = int(auth_date.timestamp())
    
    # Create a copy of data and add auth_date
    sign_data_dict = dict(data)
    sign_data_dict["auth_date"] = auth_date_timestamp
    
    # Remove hash and signature if present
    sign_data_dict.pop("hash", None)
    sign_data_dict.pop("signature", None)
    
    # Convert to URL parameters format
    params = _serialize_init_data(sign_data_dict)
    
    # Create check string from sorted parameters
    pairs = [f"{key}={value}" for key, value in sorted(params.items())]
    check_string = "\n".join(pairs)
    
    # Calculate signature
    signature = sign_data(check_string, token, options)
    
    # Add signature to parameters
    params["hash"] = signature
    
    # Return as URL-encoded string
    return urlencode(params)


def _serialize_init_data(data: Dict[str, Any]) -> Dict[str, str]:
    """
    Serialize init data dict to URL parameters format.
    
    This function converts complex objects (like user, chat) to JSON strings
    and ensures all values are strings suitable for URL encoding.
    """
    import json
    
    result = {}
    
    for key, value in data.items():
        if value is None:
            continue
            
        if key in ["user", "receiver", "chat"]:
            # Serialize objects as JSON
            result[key] = json.dumps(value, separators=(',', ':'))
        elif isinstance(value, (int, float)):
            result[key] = str(value)
        elif isinstance(value, str):
            result[key] = value
        elif isinstance(value, bool):
            result[key] = "true" if value else "false"
        else:
            # For other types, convert to JSON
            result[key] = json.dumps(value, separators=(',', ':'))
    
    return result 