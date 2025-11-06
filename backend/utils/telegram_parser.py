import json
from urllib.parse import urlparse, parse_qs, unquote
from fastapi import HTTPException
from typing import Dict, Any


def parse_telegram_link(tg_link: str) -> Dict[str, Any]:
    """
    Парсинг tg_link и извлечение user-данных из параметра `user`
    """
    try:
        parsed_url = urlparse(tg_link)
        query_params = parse_qs(parsed_url.query)

        user_data_str = query_params.get("user", [None])[0]
        if user_data_str is None:
            raise HTTPException(status_code=400, detail="User data is missing in the link")

        user_data_str = unquote(user_data_str)
        user_data = json.loads(user_data_str)
        print("РАСПАРСЕННЫЕ ДАННЫЕ:", user_data)

        return {
            "id": user_data.get("id"),
            "username": user_data.get("username"),
            "name": user_data.get("first_name"),
            "surname": user_data.get("last_name"),
            "avatar_url": user_data.get("avatar_url")
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing Telegram data: {str(e)}")
