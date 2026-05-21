from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from db.connection import init_db, close_db
from api.events import router as events_router
from api.agents import router as agents_router
from api.auth import router as auth_router
from api.search import router as search_router
from api.memory import router as memory_router
from api.telemetry import router as telemetry_router
from api.admin import router as admin_router
from api.stats import router as stats_router
from api.billing import router as billing_router
from api.community import router as community_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("ZizkaDB started")
    yield
    await close_db()
    logger.info("ZizkaDB stopped")


app = FastAPI(
    title="ZizkaDB",
    description="The operational database for AI agents",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,      prefix="/v1/auth",      tags=["auth"])
app.include_router(events_router,    prefix="/v1/events",    tags=["events"])
app.include_router(agents_router,    prefix="/v1/agents",    tags=["agents"])
app.include_router(search_router,    prefix="/v1/search",    tags=["search"])
app.include_router(memory_router,    prefix="/v1/memory",    tags=["memory"])
app.include_router(telemetry_router, prefix="/v1/telemetry", tags=["telemetry"])
app.include_router(admin_router,     prefix="/v1/admin",     include_in_schema=False)
app.include_router(stats_router,     prefix="/v1/stats",     tags=["stats"])
app.include_router(billing_router,   prefix="/v1/webhooks",  include_in_schema=False)
app.include_router(community_router, prefix="/v1/community", tags=["community"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
