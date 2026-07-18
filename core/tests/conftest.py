import os
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
SDK = ROOT.parent / "sdk" / "python"

sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(SDK))


def _truthy(value: str | None) -> bool:
    return (value or "").lower() in {"1", "true", "yes", "on"}


def pytest_addoption(parser):
    parser.addoption(
        "--run-integration",
        action="store_true",
        default=False,
        help="Run integration tests that require a running ZizkaDB stack.",
    )


def pytest_collection_modifyitems(config, items):
    run_integration = config.getoption("--run-integration") or _truthy(
        os.getenv("ZIZKADB_RUN_INTEGRATION")
    )
    if run_integration:
        return

    skip_integration = pytest.mark.skip(
        reason=(
            "requires a running ZizkaDB stack; set ZIZKADB_RUN_INTEGRATION=1 "
            "or pass --run-integration to enable"
        )
    )
    for item in items:
        if "integration" in item.keywords:
            item.add_marker(skip_integration)
