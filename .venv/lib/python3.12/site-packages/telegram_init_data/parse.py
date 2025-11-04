"""
Init data parsing functionality.

Contains the parse function for converting init data string to structured data.
"""

import json
from urllib.parse import parse_qsl, unquote
from typing import Dict, Any, Optional

from .types import InitData, User, Chat, ChatType, InitDataInput


def parse(value: InitDataInput) -> InitData:
    """
    Parse Telegram Mini App init data string into structured object.
    
    This function converts a URL-encoded init data string into a structured
    dictionary with proper types for all fields.
    
    Args:
        value: Init data string or dict to parse
        
    Returns:
        InitData: Structured init data object
        
    Example:
        >>> parse("query_id=123&user=%7B%22id%22%3A1%7D&auth_date=1234567890&hash=abc123")
        {'query_id': '123', 'user': {'id': 1}, 'auth_date': 1234567890, 'hash': 'abc123'}
    """
    # If already a dict, return as is (with some validation)
    if isinstance(value, dict):
        return _normalize_init_data(value)
    
    # Parse URL-encoded string
    parsed_params = dict(parse_qsl(value, strict_parsing=True))
    
    # Convert to structured format
    result: InitData = {}
    
    for key, raw_value in parsed_params.items():
        if key == "user" and raw_value:
            result["user"] = _parse_user(raw_value)
        elif key == "receiver" and raw_value:
            result["receiver"] = _parse_user(raw_value)
        elif key == "chat" and raw_value:
            result["chat"] = _parse_chat(raw_value)
        elif key == "chat_type" and raw_value:
            result["chat_type"] = ChatType(raw_value)
        elif key == "auth_date" and raw_value:
            result["auth_date"] = int(raw_value)
        elif key == "can_send_after" and raw_value:
            result["can_send_after"] = int(raw_value)
        elif key in ["query_id", "chat_instance", "start_param", "hash", "signature"]:
            if raw_value:
                result[key] = raw_value
    
    return result


def _parse_user(user_str: str) -> Optional[User]:
    """Parse URL-encoded user JSON string."""
    try:
        user_data = json.loads(unquote(user_str))
        if not isinstance(user_data, dict):
            return None
        
        user: User = {}
        
        # Required fields
        if "id" in user_data:
            user["id"] = int(user_data["id"])
        if "first_name" in user_data:
            user["first_name"] = str(user_data["first_name"])
        
        # Optional fields
        optional_str_fields = ["last_name", "username", "language_code", "photo_url"]
        for field in optional_str_fields:
            if field in user_data and user_data[field] is not None:
                user[field] = str(user_data[field])
        
        optional_bool_fields = ["is_bot", "is_premium", "added_to_attachment_menu", "allows_write_to_pm"]
        for field in optional_bool_fields:
            if field in user_data and user_data[field] is not None:
                user[field] = bool(user_data[field])
        
        return user
    except (json.JSONDecodeError, ValueError, TypeError):
        return None


def _parse_chat(chat_str: str) -> Optional[Chat]:
    """Parse URL-encoded chat JSON string."""
    try:
        chat_data = json.loads(unquote(chat_str))
        if not isinstance(chat_data, dict):
            return None
        
        chat: Chat = {}
        
        # Required fields
        if "id" in chat_data:
            chat["id"] = int(chat_data["id"])
        if "type" in chat_data:
            chat["type"] = ChatType(chat_data["type"])
        
        # Optional fields
        optional_str_fields = ["title", "username", "photo_url"]
        for field in optional_str_fields:
            if field in chat_data and chat_data[field] is not None:
                chat[field] = str(chat_data[field])
        
        return chat
    except (json.JSONDecodeError, ValueError, TypeError):
        return None


def _normalize_init_data(data: Dict[str, Any]) -> InitData:
    """Normalize dict init data to proper types."""
    result: InitData = {}
    
    for key, value in data.items():
        if key == "user" and isinstance(value, dict):
            result["user"] = value
        elif key == "receiver" and isinstance(value, dict):
            result["receiver"] = value
        elif key == "chat" and isinstance(value, dict):
            result["chat"] = value
        elif key == "chat_type" and value:
            result["chat_type"] = ChatType(value) if isinstance(value, str) else value
        elif key == "auth_date" and value is not None:
            result["auth_date"] = int(value)
        elif key == "can_send_after" and value is not None:
            result["can_send_after"] = int(value)
        elif key in ["query_id", "chat_instance", "start_param", "hash", "signature"]:
            if value is not None:
                result[key] = str(value)
    
    return result 