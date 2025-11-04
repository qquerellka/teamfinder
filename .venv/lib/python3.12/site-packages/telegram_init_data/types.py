"""
Telegram Init Data types.

Contains type definitions for Telegram Mini Apps initialization data.
"""

from datetime import datetime
from typing import Optional, Union, Dict, Any, TypedDict
from enum import Enum


class ChatType(str, Enum):
    """Type of chat."""
    PRIVATE = "private"
    GROUP = "group"
    SUPERGROUP = "supergroup"
    CHANNEL = "channel"


class User(TypedDict, total=False):
    """Telegram user object."""
    id: int
    first_name: str
    last_name: Optional[str]
    username: Optional[str]
    language_code: Optional[str]
    is_bot: Optional[bool]
    is_premium: Optional[bool]
    added_to_attachment_menu: Optional[bool]
    allows_write_to_pm: Optional[bool]
    photo_url: Optional[str]


class Chat(TypedDict, total=False):
    """Telegram chat object."""
    id: int
    type: ChatType
    title: Optional[str]
    username: Optional[str]
    photo_url: Optional[str]


class InitData(TypedDict, total=False):
    """Telegram Mini App initialization data."""
    query_id: Optional[str]
    user: Optional[User]
    receiver: Optional[User]
    chat: Optional[Chat]
    chat_type: Optional[ChatType]
    chat_instance: Optional[str]
    start_param: Optional[str]
    can_send_after: Optional[int]
    auth_date: int
    hash: str
    signature: Optional[str]


# Type aliases for convenience
InitDataInput = Union[str, Dict[str, Any]]
ValidateValue = Union[str, InitDataInput]
SignData = Union[InitData, Dict[str, Any]]
Text = Union[str, bytes]


class ValidateOptions(TypedDict, total=False):
    """Options for validation functions."""
    expires_in: int  # Expiration time in seconds, default 86400 (24 hours)


class Validate3rdOptions(TypedDict, total=False):
    """Options for 3rd party validation."""
    expires_in: int  # Expiration time in seconds, default 86400 (24 hours)
    test: bool  # Whether to use test mode 