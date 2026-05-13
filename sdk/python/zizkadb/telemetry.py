"""
Anonymous usage telemetry for the ZizkaDB Python SDK.

What is sent (once per install, fire-and-forget):
  install_id  — random UUID stored in ~/.zizkadb/install_id (never changes)
  sdk_version — e.g. "0.1.0"
  python      — e.g. "3.12.3"
  os          — e.g. "Linux", "Darwin", "Windows"
  mode        — "cloud" or "self-hosted"

What is NOT sent: API keys, agent names, event data, IP address, hostname.

Opt out at any time:
  export ZIZKADB_TELEMETRY=false   # shell
  ZIZKADB_TELEMETRY=false          # .env
"""

from __future__ import annotations

import os
import sys
import platform
import threading
import uuid
from pathlib import Path

_TELEMETRY_URL = "https://db.zizka.ai/v1/telemetry"
_INSTALL_ID_PATH = Path.home() / ".zizkadb" / "install_id"
_sent = False  # only fire once per process


def _get_or_create_install_id() -> str:
    try:
        _INSTALL_ID_PATH.parent.mkdir(parents=True, exist_ok=True)
        if _INSTALL_ID_PATH.exists():
            iid = _INSTALL_ID_PATH.read_text().strip()
            if iid:
                return iid
        iid = str(uuid.uuid4())
        _INSTALL_ID_PATH.write_text(iid)
        return iid
    except Exception:
        return str(uuid.uuid4())  # ephemeral fallback


def _send(mode: str) -> None:
    try:
        import urllib.request
        import json

        payload = json.dumps({
            "install_id":   _get_or_create_install_id(),
            "sdk":          "python",
            "sdk_version":  _sdk_version(),
            "python":       f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "os":           platform.system(),
            "mode":         mode,
        }).encode()

        req = urllib.request.Request(
            _TELEMETRY_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=3)
    except Exception:
        pass  # never surface telemetry errors


def _sdk_version() -> str:
    try:
        from zizkadb import __version__
        return __version__
    except Exception:
        return "unknown"


def ping(mode: str = "cloud") -> None:
    """Fire a single anonymous telemetry ping in a background thread."""
    global _sent

    if _sent:
        return
    if os.getenv("ZIZKADB_TELEMETRY", "").lower() in ("false", "0", "no", "off"):
        return

    _sent = True
    t = threading.Thread(target=_send, args=(mode,), daemon=True)
    t.start()
