import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SDK = ROOT.parent / "sdk" / "python"

sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(SDK))
