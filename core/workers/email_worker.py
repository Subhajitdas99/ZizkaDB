"""ARQ worker for email outbox processing."""

from __future__ import annotations

import asyncio
import logging
import os

from arq import cron
from arq.connections import RedisSettings

from db.connection import close_db, init_db
from services.email.processor import process_outbox_batch, scan_scheduled_campaigns

log = logging.getLogger(__name__)


async def startup(ctx):
    await init_db()
    log.info("Email worker started")


async def shutdown(ctx):
    await close_db()
    log.info("Email worker stopped")


async def drain_outbox(ctx):
    n = await process_outbox_batch()
    if n:
        log.info("Processed %s outbox emails", n)
    return n


async def scan_campaigns(ctx):
    n = await scan_scheduled_campaigns()
    if n:
        log.info("Enqueued %s scheduled campaign emails", n)
    await process_outbox_batch()
    return n


class WorkerSettings:
    redis_settings = RedisSettings.from_dsn(
        os.getenv("REDIS_URL", "redis://localhost:6379")
    )
    functions = [drain_outbox, scan_campaigns]
    cron_jobs = [
        cron(drain_outbox, minute=set(range(60))),
        cron(scan_campaigns, minute={0, 15, 30, 45}),
    ]
    on_startup = startup
    on_shutdown = shutdown
    max_jobs = 5
    job_timeout = 300


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    from arq import run_worker

    run_worker(WorkerSettings)
