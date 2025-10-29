
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_session
from app.services.matchmaking import MatchmakingService
router = APIRouter(prefix="/invites", tags=["invites"])
@router.post("/{invite_id}/accept")
async def accept_invite(invite_id: int, x_user_id: int | None = Header(default=None, convert_underscores=False), session: AsyncSession = Depends(get_session)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing X-User-Id header")
    await MatchmakingService.accept_invite(session, invite_id, x_user_id)
    await session.commit()
    return {"ok": True}
