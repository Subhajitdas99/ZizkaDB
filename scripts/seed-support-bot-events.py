#!/usr/bin/env python3
"""Seed support-bot with 50+ sessions and 150+ events for drift/baseline testing."""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
from datetime import datetime, timezone

from zizkadb import ZizkaDB

AGENT = "support-bot"
HOST = os.getenv("ZIZKADB_HOST", "http://localhost:8000")
SESSION_COUNT = int(os.getenv("ZIZKADB_SEED_SESSIONS", "55"))
EVENTS_PER_SESSION = int(os.getenv("ZIZKADB_SEED_EVENTS_PER_SESSION", "3"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--reuse-sessions",
        action="store_true",
        help="Use fixed seed-session-001..N IDs (deterministic integration tests)",
    )
    parser.add_argument(
        "--run-id",
        default="",
        help="Override run id prefix for session IDs (default: UTC timestamp)",
    )
    return parser.parse_args()


def session_id_for(i: int, run_id: str, reuse: bool) -> str:
    if reuse:
        return f"seed-session-{i:03d}"
    return f"seed-{run_id}-session-{i:03d}"


async def main(args: argparse.Namespace) -> None:
    run_id = args.run_id or datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    print(f"→ Seeding {AGENT} @ {HOST}")
    print(f"  sessions={SESSION_COUNT}, events_per_session={EVENTS_PER_SESSION}")
    print(f"  run_id={run_id}, reuse_sessions={args.reuse_sessions}")

    total_events = 0
    async with ZizkaDB(host=HOST) as db:
        for i in range(1, SESSION_COUNT + 1):
            session_id = session_id_for(i, run_id, args.reuse_sessions)
            user = await db.log(
                agent=AGENT,
                event="user_message",
                data={"text": f"Question from session {i}", "user_id": f"user-{i}"},
                session_id=session_id,
            )
            total_events += 1
            parent = user.event_id

            tool = await db.log(
                agent=AGENT,
                event="tool_call",
                data={"tool": "lookup_order", "session": i},
                parent_id=parent,
                session_id=session_id,
            )
            total_events += 1
            parent = tool.event_id

            if i % 10 == 0:
                err = await db.log(
                    agent=AGENT,
                    event="error",
                    data={"error": "simulated failure", "session": i},
                    parent_id=parent,
                    session_id=session_id,
                )
                total_events += 1
                parent = err.event_id

            if EVENTS_PER_SESSION >= 3:
                await db.log(
                    agent=AGENT,
                    event="assistant_response",
                    data={"tokens": 120 + i, "session": i},
                    parent_id=parent,
                    session_id=session_id,
                )
                total_events += 1

            if i % 10 == 0:
                print(f"  … session {i}/{SESSION_COUNT} ({total_events} events so far)")

        baseline = await db.baseline(AGENT, recent_window=50)
        recent = await db.query(agent=AGENT, limit=5)

    print("")
    print(f"✓ Logged {total_events} events across {SESSION_COUNT} sessions")
    print(f"  run_id:                 {run_id}")
    print(f"  Sample recent events:   {len(recent)} returned (limit 5)")
    print(f"  Baseline status:        {baseline.get('status')}")
    if baseline.get("drift"):
        print(f"  Drift score:            {baseline['drift'].get('score')}")
        print(f"  Drift verdict:          {baseline['drift'].get('verdict')}")


if __name__ == "__main__":
    try:
        asyncio.run(main(parse_args()))
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        print(
            "\nStart the stack first:\n"
            "  bash scripts/restart-native-stack.sh\n"
            "  bash scripts/bootstrap-local.sh\n",
            file=sys.stderr,
        )
        sys.exit(1)
