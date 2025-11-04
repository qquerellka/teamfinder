"""
Token hashing functionality.

Contains the hash_token function for generating HMAC keys.
"""

import hmac
import hashlib
from .types import Text


def hash_token(token: Text) -> bytes:
    """
    Hash token using HMAC-SHA256 with 'WebAppData' as key.
    
    This function generates a secret key for signing init data
    by computing HMAC-SHA256 of the bot token with 'WebAppData' as key.
    
    Args:
        token: Bot token to hash (string or bytes)
        
    Returns:
        bytes: HMAC-SHA256 digest of the token
        
    Example:
        >>> hash_token("bot_token")
        b'\\x1a\\x2b\\x3c...'
    """
    token_bytes = token.encode('utf-8') if isinstance(token, str) else token
    return hmac.new(b"WebAppData", token_bytes, hashlib.sha256).digest() 