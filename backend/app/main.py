
from fastapi import FastAPI
from app.api.v1.health import router as health_router
from app.api.v1.invites import router as invites_router
from app.api.v1.responses import router as responses_router
app = FastAPI(title="Teamfinder API", version="0.1.0")
app.include_router(health_router, prefix="/api/v1")
app.include_router(invites_router, prefix="/api/v1")
app.include_router(responses_router, prefix="/api/v1")
