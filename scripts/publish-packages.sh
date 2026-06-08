#!/usr/bin/env bash
# Publish zizkadb-sdk (PyPI + npm) and zizkadb-mcp (PyPI).
#
# Prerequisites:
#   PyPI:  export TWINE_USERNAME=__token__
#          export TWINE_PASSWORD=pypi-...   # API token with upload scope
#   npm:   npm login   (must own zizkadb-sdk on npmjs.com)
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Build Python SDK"
pip install -q build twine
(cd sdk/python && python3 -m build)

echo "→ Build MCP"
(cd mcp && python3 -m build)

echo "→ Build TypeScript SDK"
(cd sdk/typescript && npm ci -q && npm run build)

echo "→ Upload to PyPI"
twine upload sdk/python/dist/zizkadb_sdk-0.2.3*
twine upload mcp/dist/zizkadb_mcp-0.1.3*

echo "→ Publish to npm"
(cd sdk/typescript && npm publish --access public)

echo ""
echo "Done. Verify:"
echo "  pip index versions zizkadb-sdk"
echo "  pip index versions zizkadb-mcp"
echo "  npm view zizkadb-sdk version"
