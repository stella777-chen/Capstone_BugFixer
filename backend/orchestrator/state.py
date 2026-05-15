from __future__ import annotations

from typing import Any
from uuid import uuid4


SESSIONS: dict[str, dict[str, Any]] = {}


def get_or_create_session(session_id: str | None) -> tuple[str, dict[str, Any]]:
    if session_id and session_id in SESSIONS:
        return session_id, SESSIONS[session_id]

    new_session_id = session_id or str(uuid4())
    state: dict[str, Any] = {
        "messages": [],
        "requirements": {},
        "lastUiConfig": None,
        "lastFocusedMetric": None,
    }
    SESSIONS[new_session_id] = state
    return new_session_id, state


def append_message(state: dict[str, Any], role: str, content: str) -> None:
    state.setdefault("messages", []).append({"role": role, "content": content})


def update_focus(state: dict[str, Any], requirements: dict[str, Any]) -> None:
    metrics = requirements.get("metrics") or []
    if len(metrics) == 1:
        state["lastFocusedMetric"] = metrics[0]


def get_focused_metric(state: dict[str, Any]) -> str | None:
    focused_metric = state.get("lastFocusedMetric")
    if isinstance(focused_metric, str):
        return focused_metric

    metrics = (state.get("requirements") or {}).get("metrics") or []
    if len(metrics) == 1 and isinstance(metrics[0], str):
        return metrics[0]

    return None
