"""
FastAPI integration for Telegram Init Data validation.

Provides middleware and dependencies for easy integration with FastAPI applications.
"""

from typing import Optional, Dict, Any, Callable
from fastapi import HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .validate import validate
from .parse import parse
from .is_valid import is_valid
from .types import InitData, ValidateOptions
from .exceptions import TelegramInitDataError


class TelegramInitDataAuth:
    """
    FastAPI authentication class for Telegram Init Data validation.
    
    This class provides a convenient way to validate Telegram Mini App init data
    in FastAPI applications using dependency injection.
    """
    
    def __init__(
        self,
        bot_token: str,
        header_name: str = "Authorization",
        scheme_name: str = "tma",
        auto_error: bool = True,
        validate_options: Optional[ValidateOptions] = None
    ):
        """
        Initialize the authentication handler.
        
        Args:
            bot_token: Your bot token from @BotFather
            header_name: Name of the header containing init data (default: "Authorization")
            scheme_name: Authentication scheme name (default: "tma")
            auto_error: Whether to automatically raise HTTPException on validation errors
            validate_options: Options for init data validation (expires_in, etc.)
        """
        self.bot_token = bot_token
        self.header_name = header_name
        self.scheme_name = scheme_name
        self.auto_error = auto_error
        self.validate_options = validate_options or {}
    
    def __call__(self, authorization: Optional[str] = Header(None)) -> InitData:
        """
        FastAPI dependency for validating init data from Authorization header.
        
        Expected header format: "tma <init_data>"
        
        Args:
            authorization: Authorization header value
            
        Returns:
            InitData: Parsed and validated init data
            
        Raises:
            HTTPException: If validation fails and auto_error is True
        """
        if not authorization:
            if self.auto_error:
                raise HTTPException(
                    status_code=401,
                    detail="Authorization header missing",
                    headers={"WWW-Authenticate": self.scheme_name}
                )
            return None
        
        # Check if authorization starts with scheme name
        expected_prefix = f"{self.scheme_name} "
        if not authorization.startswith(expected_prefix):
            if self.auto_error:
                raise HTTPException(
                    status_code=401,
                    detail=f"Invalid authorization format. Expected '{self.scheme_name} <init_data>'",
                    headers={"WWW-Authenticate": self.scheme_name}
                )
            return None
        
        # Extract init data
        init_data_str = authorization[len(expected_prefix):]
        
        try:
            # Validate init data
            validate(init_data_str, self.bot_token, self.validate_options)
            
            # Parse and return structured data
            return parse(init_data_str)
            
        except TelegramInitDataError as e:
            if self.auto_error:
                raise HTTPException(
                    status_code=401,
                    detail=f"Invalid init data: {str(e)}",
                    headers={"WWW-Authenticate": self.scheme_name}
                )
            return None


class TelegramInitDataBearer(HTTPBearer):
    """
    FastAPI HTTPBearer authentication for Telegram Init Data.
    
    This class extends HTTPBearer to provide Bearer token authentication
    where the token is actually init data.
    """
    
    def __init__(
        self,
        bot_token: str,
        validate_options: Optional[ValidateOptions] = None,
        auto_error: bool = True
    ):
        """
        Initialize the Bearer authentication handler.
        
        Args:
            bot_token: Your bot token from @BotFather
            validate_options: Options for init data validation
            auto_error: Whether to automatically raise HTTPException on validation errors
        """
        super().__init__(auto_error=auto_error)
        self.bot_token = bot_token
        self.validate_options = validate_options or {}
    
    async def __call__(self, credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))) -> InitData:
        """
        Validate Bearer token as init data.
        
        Args:
            credentials: HTTP Bearer credentials
            
        Returns:
            InitData: Parsed and validated init data
            
        Raises:
            HTTPException: If validation fails and auto_error is True
        """
        if not credentials:
            if self.auto_error:
                raise HTTPException(
                    status_code=401,
                    detail="Authorization header missing",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            return None
        
        try:
            # Validate init data
            validate(credentials.credentials, self.bot_token, self.validate_options)
            
            # Parse and return structured data
            return parse(credentials.credentials)
            
        except TelegramInitDataError as e:
            if self.auto_error:
                raise HTTPException(
                    status_code=401,
                    detail=f"Invalid init data: {str(e)}",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            return None


def create_init_data_dependency(
    bot_token: str,
    validate_options: Optional[ValidateOptions] = None,
    header_name: str = "X-Init-Data",
    auto_error: bool = True
) -> Callable:
    """
    Create a FastAPI dependency for validating init data from custom header.
    
    Args:
        bot_token: Your bot token from @BotFather
        validate_options: Options for init data validation
        header_name: Name of the header containing init data
        auto_error: Whether to automatically raise HTTPException on validation errors
        
    Returns:
        Callable: FastAPI dependency function
        
    Example:
        >>> auth_dependency = create_init_data_dependency("YOUR_BOT_TOKEN")
        >>> 
        >>> @app.get("/me")
        >>> async def get_user(init_data: InitData = Depends(auth_dependency)):
        ...     return {"user_id": init_data["user"]["id"]}
    """
    def dependency(header_value: Optional[str] = Header(None, alias=header_name)) -> InitData:
        if not header_value:
            if auto_error:
                raise HTTPException(
                    status_code=401,
                    detail=f"Header '{header_name}' missing"
                )
            return None
        
        try:
            # Validate init data
            validate(header_value, bot_token, validate_options)
            
            # Parse and return structured data
            return parse(header_value)
            
        except TelegramInitDataError as e:
            if auto_error:
                raise HTTPException(
                    status_code=401,
                    detail=f"Invalid init data: {str(e)}"
                )
            return None
    
    return dependency


def create_optional_init_data_dependency(
    bot_token: str,
    validate_options: Optional[ValidateOptions] = None,
    header_name: str = "X-Init-Data"
) -> Callable:
    """
    Create a FastAPI dependency for optional init data validation.
    
    This dependency won't raise exceptions if init data is missing or invalid,
    instead returning None.
    
    Args:
        bot_token: Your bot token from @BotFather
        validate_options: Options for init data validation
        header_name: Name of the header containing init data
        
    Returns:
        Callable: FastAPI dependency function that returns Optional[InitData]
        
    Example:
        >>> optional_auth = create_optional_init_data_dependency("YOUR_BOT_TOKEN")
        >>> 
        >>> @app.get("/content")
        >>> async def get_content(init_data: Optional[InitData] = Depends(optional_auth)):
        ...     if init_data:
        ...         return {"user_content": True}
        ...     return {"public_content": True}
    """
    def dependency(header_value: Optional[str] = Header(None, alias=header_name)) -> Optional[InitData]:
        if not header_value:
            return None
        
        try:
            # Validate init data
            validate(header_value, bot_token, validate_options)
            
            # Parse and return structured data
            return parse(header_value)
            
        except TelegramInitDataError:
            return None
    
    return dependency


# Utility function for quick setup
def get_telegram_auth(
    bot_token: str,
    auth_type: str = "header",
    validate_options: Optional[ValidateOptions] = None,
    **kwargs
) -> Callable:
    """
    Quick setup function for Telegram init data authentication.
    
    Args:
        bot_token: Your bot token from @BotFather
        auth_type: Type of authentication ("header", "bearer", "custom")
        validate_options: Options for init data validation
        **kwargs: Additional arguments for specific auth types
        
    Returns:
        Callable: FastAPI dependency function
        
    Example:
        >>> # Using Authorization header with "tma" scheme
        >>> auth = get_telegram_auth("YOUR_BOT_TOKEN", "header")
        >>> 
        >>> # Using Bearer token
        >>> auth = get_telegram_auth("YOUR_BOT_TOKEN", "bearer")
        >>> 
        >>> # Using custom header
        >>> auth = get_telegram_auth("YOUR_BOT_TOKEN", "custom", header_name="X-Telegram-Data")
    """
    if auth_type == "header":
        return TelegramInitDataAuth(bot_token, validate_options=validate_options, **kwargs)
    elif auth_type == "bearer":
        return TelegramInitDataBearer(bot_token, validate_options=validate_options, **kwargs)
    elif auth_type == "custom":
        return create_init_data_dependency(bot_token, validate_options, **kwargs)
    else:
        raise ValueError(f"Unknown auth_type: {auth_type}. Use 'header', 'bearer', or 'custom'.")


# Example usage and documentation
__all__ = [
    "TelegramInitDataAuth",
    "TelegramInitDataBearer", 
    "create_init_data_dependency",
    "create_optional_init_data_dependency",
    "get_telegram_auth",
] 