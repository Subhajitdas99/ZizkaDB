from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from db.connection import init_db, close_db
from api.events import router as events_router
from api.agents import router as agents_router
from api.auth import router as auth_router
from api.search import router as search_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("AgentDB started")
    yield
    await close_db()
    logger.info("AgentDB stopped")


app = FastAPI(
    title="AgentDB",
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

app.include_router(auth_router,   prefix="/v1/auth",   tags=["auth"])
app.include_router(events_router, prefix="/v1/events", tags=["events"])
app.include_router(agents_router, prefix="/v1/agents", tags=["agents"])
app.include_router(search_router, prefix="/v1/search", tags=["search"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
