#!/usr/bin/env bash
# Build and publish zizkadb-langchain + zizkadb-crewai to PyPI (first-time or new version).
#
# Prerequisites:
#   export TWINE_USERNAME=__token__
#   export TWINE_PASSWORD=pypi-...
#
# Usage:
#   bash scripts/publish-integrations.sh          # build + upload both
#   bash scripts/publish-integrations.sh --build-only
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BUILD_ONLY=false
[[ "${1:-}" == "--build-only" ]] && BUILD_ONLY=true

read_ver() {
  grep '^version' "$1" | head -1 | sed 's/.*"\(.*\)".*/\1/'
}

LANGCHAIN_VER="$(read_ver integrations/langchain/pyproject.toml)"
CREWAI_VER="$(read_ver integrations/crewai/pyproject.toml)"

pip install -q build twine

echo "→ Build zizkadb-langchain ${LANGCHAIN_VER}"
(cd integrations/langchain && rm -rf dist build *.egg-info && python3 -m build)
twine check "integrations/langchain/dist/zizkadb_langchain-${LANGCHAIN_VER}"*

echo "→ Build zizkadb-crewai ${CREWAI_VER}"
(cd integrations/crewai && rm -rf dist build *.egg-info && python3 -m build)
twine check "integrations/crewai/dist/zizkadb_crewai-${CREWAI_VER}"*

if $BUILD_ONLY; then
  echo ""
  echo "Build OK. Upload when ready:"
  echo "  export TWINE_USERNAME=__token__"
  echo "  export TWINE_PASSWORD=pypi-..."
  echo "  bash scripts/publish-integrations.sh"
  exit 0
fi

if [[ "${TWINE_USERNAME:-}" != "__token__" ]]; then
  echo "Set PyPI credentials before upload:"
  echo '  export TWINE_USERNAME=__token__'
  echo '  export TWINE_PASSWORD=pypi-...'
  exit 1
fi

if [[ -z "${TWINE_PASSWORD:-}" ]]; then
  echo "TWINE_PASSWORD is empty."
  exit 1
fi

echo "→ Upload zizkadb-langchain ${LANGCHAIN_VER}"
twine upload --verbose "integrations/langchain/dist/zizkadb_langchain-${LANGCHAIN_VER}"*

echo "→ Upload zizkadb-crewai ${CREWAI_VER}"
twine upload --verbose "integrations/crewai/dist/zizkadb_crewai-${CREWAI_VER}"*

echo ""
echo "Verify:"
echo "  pip index versions zizkadb-langchain"
echo "  pip index versions zizkadb-crewai"
echo "  pip install zizkadb-langchain zizkadb-crewai"
