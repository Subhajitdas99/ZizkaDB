from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class Event:
    event_id: str
    agent: str
    timestamp: datetime
    event: str
    data: dict[str, Any]
    parent_id: str | None = None
    session_id: str | None = None
    sequence_no: int = 0
    score: float | None = None  # set on search results

    @classmethod
    def from_dict(cls, d: dict) -> "Event":
        return cls(
            event_id=d["event_id"],
            agent=d["agent"],
            timestamp=datetime.fromisoformat(d["timestamp"]),
            event=d["event"],
            data=d["data"],
            parent_id=d.get("parent_id"),
            session_id=d.get("session_id"),
            sequence_no=d.get("sequence_no", 0),
            score=d.get("score"),
        )

    def __repr__(self) -> str:
        return (
            f"Event(id={self.event_id[:8]}... "
            f"agent={self.agent!r} "
            f"event={self.event!r} "
            f"at={self.timestamp.strftime('%H:%M:%S')})"
        )


@dataclass
class LogResult:
    event_id: str
    timestamp: datetime
    sequence_no: int
    checksum: str

    @classmethod
    def from_dict(cls, d: dict) -> "LogResult":
        return cls(
            event_id=d["event_id"],
            timestamp=datetime.fromisoformat(d["timestamp"]),
            sequence_no=d["sequence_no"],
            checksum=d["checksum"],
        )


@dataclass
class CausalChain:
    event_id: str
    chain_length: int
    chain: list[Event]

    def print(self) -> None:
        """Pretty-print the causal chain as a tree."""
        if not self.chain:
            print("(empty chain)")
            return

        for i, event in enumerate(self.chain):
            indent = "    " * i
            connector = "└── " if i > 0 else ""
            print(
                f"{indent}{connector}"
                f"{event.event}: {_truncate(str(event.data), 60)}"
                f"  [{event.timestamp.strftime('%H:%M:%S')}]"
            )

    def __repr__(self) -> str:
        return f"CausalChain(length={self.chain_length})"


@dataclass
class AgentState:
    agent: str
    at: datetime
    event_count: int
    state: dict[str, Any]


@dataclass
class AgentInfo:
    agent: str
    first_seen: datetime
    last_seen: datetime
    event_count: int

    @classmethod
    def from_dict(cls, d: dict) -> "AgentInfo":
        return cls(
            agent=d["agent"],
            first_seen=datetime.fromisoformat(d["first_seen"]),
            last_seen=datetime.fromisoformat(d["last_seen"]),
            event_count=d["event_count"],
        )


def _truncate(s: str, n: int) -> str:
    return s if len(s) <= n else s[:n] + "..."
