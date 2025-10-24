from fastapi import APIRouter
router = APIRouter(tags=["health"])
@router.get("/healthz")
async def healthz():
    return {"ok": True}
@router.get("/version")
async def version():
    return {"version": "0.1.0"}
