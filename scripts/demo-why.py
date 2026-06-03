#!/usr/bin/env python3
"""Log a 3-step causal chain and print db.why() — use for README GIF / asciinema."""

import asyncio
import os
import sys

from zizkadb import ZizkaDB

HOST = os.getenv("ZIZKADB_HOST", "http://localhost:8000")


async def main() -> None:
    print(f"→ ZizkaDB @ {HOST}\n")

    async with ZizkaDB(host=HOST) as db:
        user = await db.log(
            agent="support-bot",
            event="user_message",
            data={"text": "Why was my order delayed?"},
        )
        reply = await db.log(
            agent="support-bot",
            event="llm_response",
            data={"model": "gpt-4o", "tokens": 412},
            parent_id=user.event_id,
        )
        tool = await db.log(
            agent="support-bot",
            event="tool_call",
            data={"tool": "lookup_order", "order_id": "ORD-8842"},
            parent_id=reply.event_id,
        )

        print("Logged chain. Walking back with db.why():\n")
        chain = await db.why(tool.event_id)
        chain.print()

    print("\n✓ Done — same output as README demo / GIF recording.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        print(
            "\nStart the stack first:\n"
            "  bash scripts/setup-local.sh\n"
            "  pip install zizkadb-sdk\n",
            file=sys.stderr,
        )
        sys.exit(1)
