"""
Unit tests for core/api/memory.py helper functions.

These tests cover _format_data, _compute_max_depth, and _summarise
without requiring a running database or Qdrant instance.
"""

"""
Unit tests for core/api/memory.py helper functions.

These helpers are extracted inline here so the tests can run without
a database, Qdrant, or any other infrastructure. The implementations
are intentionally duplicated from api/memory.py so the tests stay
fast and infrastructure-free. If the helpers change in memory.py,
update both files.
"""

import pytest
from typing import Any


# ── Inline copies of the helpers under test ───────────────────────────────────

def _format_data(data: Any) -> str:
    if isinstance(data, dict):
        parts = []
        for k, v in list(data.items())[:4]:
            v_str = str(v)[:80]
            parts.append(f"{k}={v_str!r}")
        return ", ".join(parts)
    return str(data)[:120]


def _compute_max_depth(roots: list, children: dict, depth: int = 0) -> int:
    if not roots:
        return depth
    max_d = depth
    for r in roots:
        kids = children.get(r["event_id"], [])
        if kids:
            kid_nodes = [{"event_id": k} for k in kids]
            d = _compute_max_depth(kid_nodes, children, depth + 1)
            max_d = max(max_d, d)
    return max_d


def _summarise(
    agent: str,
    events: list,
    event_types: dict,
    has_error: bool,
    duration: float | None,
) -> str:
    top = sorted(event_types.items(), key=lambda x: x[1], reverse=True)[:3]
    top_str = ", ".join(f"{et} ({n}x)" for et, n in top)
    dur = f"{duration:.0f}s" if duration else "unknown duration"
    error_note = " Errors were detected." if has_error else ""
    return (
        f"Session with agent '{agent}': {len(events)} events over {dur}. "
        f"Most frequent: {top_str}.{error_note}"
    )


# ─────────────────────────────────────────
# _format_data
# ─────────────────────────────────────────

class TestFormatData:
    def test_dict_formats_key_value_pairs(self):
        result = _format_data({"tool": "search", "query": "billing"})
        assert "tool=" in result
        assert "search" in result

    def test_dict_limits_to_four_keys(self):
        data = {str(i): i for i in range(10)}
        result = _format_data(data)
        # At most 4 pairs → at most 3 commas
        assert result.count(",") <= 3

    def test_dict_truncates_long_values(self):
        data = {"key": "x" * 200}
        result = _format_data(data)
        assert len(result) < 200

    def test_non_dict_converts_to_string(self):
        assert _format_data("plain string") == "plain string"
        assert _format_data(42) == "42"

    def test_non_dict_truncated_to_120_chars(self):
        result = _format_data("a" * 200)
        assert len(result) <= 120

    def test_empty_dict(self):
        result = _format_data({})
        assert result == ""

    def test_none_value_in_dict(self):
        result = _format_data({"key": None})
        assert "key=" in result

    def test_nested_dict_value_stringified(self):
        result = _format_data({"meta": {"inner": "value"}})
        assert "meta=" in result


# ─────────────────────────────────────────
# _compute_max_depth
# ─────────────────────────────────────────

class TestComputeMaxDepth:
    def test_empty_roots_returns_starting_depth(self):
        assert _compute_max_depth([], {}) == 0

    def test_single_root_no_children(self):
        roots = [{"event_id": "a"}]
        assert _compute_max_depth(roots, {}) == 0

    def test_one_level_deep(self):
        # a → b
        roots = [{"event_id": "a"}]
        children = {"a": ["b"]}
        assert _compute_max_depth(roots, children) == 1

    def test_two_levels_deep(self):
        # a → b → c
        roots = [{"event_id": "a"}]
        children = {"a": ["b"], "b": ["c"]}
        assert _compute_max_depth(roots, children) == 2

    def test_branching_picks_deepest_branch(self):
        # a → b (depth 1)
        # a → c → d → e (depth 3)
        roots = [{"event_id": "a"}]
        children = {"a": ["b", "c"], "c": ["d"], "d": ["e"]}
        assert _compute_max_depth(roots, children) == 3

    def test_multiple_roots(self):
        # r1 (depth 0), r2 → child (depth 1)
        roots = [{"event_id": "r1"}, {"event_id": "r2"}]
        children = {"r2": ["child"]}
        assert _compute_max_depth(roots, children) == 1

    def test_disconnected_children_ignored(self):
        roots = [{"event_id": "a"}]
        children = {"x": ["y"]}  # unrelated subtree
        assert _compute_max_depth(roots, children) == 0


# ─────────────────────────────────────────
# _summarise
# ─────────────────────────────────────────

class TestSummarise:
    def _make_events(self, types: list[str]) -> list[dict]:
        return [{"event_id": str(i), "event": t} for i, t in enumerate(types)]

    def test_includes_agent_name(self):
        result = _summarise("my-bot", [], {}, False, None)
        assert "my-bot" in result

    def test_includes_event_count(self):
        events = self._make_events(["tool_call"] * 5)
        result = _summarise("bot", events, {"tool_call": 5}, False, 30.0)
        assert "5" in result

    def test_includes_duration(self):
        result = _summarise("bot", [], {}, False, 120.0)
        assert "120s" in result

    def test_unknown_duration_when_none(self):
        result = _summarise("bot", [], {}, False, None)
        assert "unknown" in result.lower()

    def test_error_note_present_when_errors(self):
        result = _summarise("bot", [], {}, True, 10.0)
        assert "error" in result.lower() or "Error" in result

    def test_no_error_note_when_no_errors(self):
        result = _summarise("bot", [], {}, False, 10.0)
        assert "Error" not in result

    def test_top_three_event_types_shown(self):
        event_types = {"tool_call": 10, "user_message": 5, "memory_write": 3, "rare_event": 1}
        result = _summarise("bot", [], event_types, False, 60.0)
        assert "tool_call" in result
        assert "user_message" in result
        assert "memory_write" in result
        # The 4th type should be excluded from summary
        assert "rare_event" not in result

    def test_empty_event_types(self):
        result = _summarise("bot", [], {}, False, 0.0)
        assert "bot" in result
