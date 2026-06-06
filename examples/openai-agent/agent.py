"""OpenAI + ZizkaDB — causal logging with parent_id."""

import asyncio
import os

from openai import AsyncOpenAI
from zizkadb import ZizkaDB

AGENT = os.getenv("ZIZKADB_AGENT", "gpt-4o-agent")
API_KEY = os.getenv("ZIZKADB_API_KEY")
HOST = os.getenv("ZIZKADB_HOST")


async def run(user_input: str) -> str:
    kwargs = {"api_key": API_KEY} if API_KEY else {"host": HOST or "http://localhost:8000"}
    async with ZizkaDB(**kwargs) as db:
        client = AsyncOpenAI()
        turn = await db.log(
            agent=AGENT,
            event="user_message",
            data={"text": user_input},
        )
        response = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": user_input}],
        )
        text = response.choices[0].message.content or ""
        await db.log(
            agent=AGENT,
            event="assistant_response",
            data={"text": text, "model": response.model},
            parent_id=turn.event_id,
        )
    return text


async def main() -> None:
    reply = await run("What is causal lineage in agent systems?")
    print(reply)


if __name__ == "__main__":
    asyncio.run(main())
