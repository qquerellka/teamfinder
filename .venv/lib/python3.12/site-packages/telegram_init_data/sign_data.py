"""
Data signing functionality.

Contains the sign_data function for creating HMAC-SHA256 signatures.
"""

import hmac
import hashlib
from .types import Text, ValidateOptions
from .hash_token import hash_token


def sign_data(data: Text, token: Text, options: ValidateOptions = None) -> str:
    """
    Sign data using HMAC-SHA256 with hashed token.
    
    This function creates a signature of the provided data using
    HMAC-SHA256 with the hashed bot token as the key.
    
    Args:
        data: Data to sign (string or bytes)
        token: Bot token to use for signing (string or bytes)
        options: Additional options (currently unused)
        
    Returns:
        str: Hexadecimal representation of the HMAC-SHA256 signature
        
    Example:
        >>> sign_data("hello world", "bot_token")
        'a1b2c3d4e5f6...'
    """
    # Convert data to bytes if needed
    data_bytes = data.encode('utf-8') if isinstance(data, str) else data
    
    # Hash the token to get the secret key
    secret_key = hash_token(token)
    
    # Create HMAC-SHA256 signature
    signature = hmac.new(secret_key, data_bytes, hashlib.sha256)
    
    # Return hex digest
    return signature.hexdigest() 