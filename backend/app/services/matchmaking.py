
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
class MatchmakingService:
    @staticmethod
    async def accept_invite(session: AsyncSession, invite_id: int, actor_user_id: int) -> None:
        await session.execute(text("SELECT accept_invite(:iid, :uid)"), {"iid": invite_id, "uid": actor_user_id})
    @staticmethod
    async def accept_response(session: AsyncSession, response_id: int, actor_user_id: int) -> None:
        await session.execute(text("SELECT accept_response(:rid, :uid)"), {"rid": response_id, "uid": actor_user_id})
