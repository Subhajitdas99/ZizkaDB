#!/usr/bin/env bash
# Publish zizkadb-sdk, zizkadb-mcp, zizkadb-langchain, zizkadb-crewai (PyPI) + zizkadb-sdk (npm).
#
# PyPI 403 Forbidden usually means:
#   - Token is from a PyPI account that does NOT own the package name
#   - TWINE_USERNAME is not exactly __token__
#   - Token scope is "single project" but wrong project name
#   - Token expired or copied with extra whitespace/newlines
#
# Fix: https://pypi.org/manage/account/token/
#   - Scope: "Entire account" (or all four project names)
#   - export TWINE_USERNAME=__token__
#   - export TWINE_PASSWORD=pypi-AgEIcHlwaS5vcmcC...   # full token, no quotes
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

read_ver() {
  grep '^version' "$1" | head -1 | sed 's/.*"\(.*\)".*/\1/'
}

SDK_VER="$(read_ver sdk/python/pyproject.toml)"
MCP_VER="$(read_ver mcp/pyproject.toml)"
LANGCHAIN_VER="$(read_ver integrations/langchain/pyproject.toml)"
CREWAI_VER="$(read_ver integrations/crewai/pyproject.toml)"

if [[ "${TWINE_USERNAME:-}" != "__token__" ]]; then
  echo "Set PyPI credentials before running:"
  echo '  export TWINE_USERNAME=__token__'
  echo '  export TWINE_PASSWORD=pypi-...'
  exit 1
fi

if [[ -z "${TWINE_PASSWORD:-}" ]]; then
  echo "TWINE_PASSWORD is empty."
  exit 1
fi

pip install -q build twine

echo "→ Build Python SDK ${SDK_VER}"
(cd sdk/python && rm -rf dist build && python3 -m build)

echo "→ Build MCP ${MCP_VER}"
(cd mcp && rm -rf dist build && python3 -m build)

echo "→ Build zizkadb-langchain ${LANGCHAIN_VER}"
(cd integrations/langchain && rm -rf dist build && python3 -m build)

echo "→ Build zizkadb-crewai ${CREWAI_VER}"
(cd integrations/crewai && rm -rf dist build && python3 -m build)

echo "→ Build TypeScript SDK"
(cd sdk/typescript && npm ci -q && npm run build)

echo "→ Upload zizkadb-sdk ${SDK_VER} to PyPI"
twine upload --verbose "sdk/python/dist/zizkadb_sdk-${SDK_VER}"*

echo "→ Upload zizkadb-mcp ${MCP_VER} to PyPI"
twine upload --verbose "mcp/dist/zizkadb_mcp-${MCP_VER}"*

echo "→ Upload zizkadb-langchain ${LANGCHAIN_VER} to PyPI"
twine upload --verbose "integrations/langchain/dist/zizkadb_langchain-${LANGCHAIN_VER}"*

echo "→ Upload zizkadb-crewai ${CREWAI_VER} to PyPI"
twine upload --verbose "integrations/crewai/dist/zizkadb_crewai-${CREWAI_VER}"*

echo "→ Publish to npm (run: npm login --auth-type=web  if not logged in)"
(cd sdk/typescript && npm publish --access public)

echo ""
echo "Verify (run each command separately):"
echo "  pip index versions zizkadb-sdk"
echo "  pip index versions zizkadb-mcp"
echo "  pip index versions zizkadb-langchain"
echo "  pip index versions zizkadb-crewai"
echo "  npm view zizkadb-sdk version"
