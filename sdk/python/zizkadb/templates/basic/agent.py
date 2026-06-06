"""Minimal ZizkaDB agent — log → link → why()."""

import asyncio
import os

from zizkadb import ZizkaDB

AGENT = os.getenv("ZIZKADB_AGENT", "my-agent")
API_KEY = os.getenv("ZIZKADB_API_KEY")
HOST = os.getenv("ZIZKADB_HOST")


async def main() -> None:
    kwargs = {"api_key": API_KEY} if API_KEY else {"host": HOST or "http://localhost:8000"}
    async with ZizkaDB(**kwargs) as db:
        msg = await db.log(
            agent=AGENT,
            event="user_message",
            data={"text": "Hello from my first agent"},
        )
        tool = await db.log(
            agent=AGENT,
            event="tool_call",
            data={"tool": "echo", "args": {"message": "hello"}},
            parent_id=msg.event_id,
        )
        (await db.why(tool.event_id)).print()


if __name__ == "__main__":
    asyncio.run(main())
