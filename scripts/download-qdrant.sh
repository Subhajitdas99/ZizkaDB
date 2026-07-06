#!/usr/bin/env bash
# Download pinned Qdrant binary for native self-host (no Docker).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

QDRANT_VERSION="${QDRANT_VERSION:-v1.13.5}"
INSTALL_DIR="$ROOT/.local/qdrant"
BINARY="$INSTALL_DIR/qdrant"

if [ -x "$BINARY" ]; then
  echo "✓ Qdrant binary already present ($BINARY)"
  exit 0
fi

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS-$ARCH" in
  darwin-arm64|darwin-aarch64)
    ASSET="qdrant-aarch64-apple-darwin.tar.gz"
    ;;
  darwin-x86_64)
    ASSET="qdrant-x86_64-apple-darwin.tar.gz"
    ;;
  linux-x86_64|linux-amd64)
    ASSET="qdrant-x86_64-unknown-linux-gnu.tar.gz"
    ;;
  linux-aarch64|linux-arm64)
    ASSET="qdrant-aarch64-unknown-linux-gnu.tar.gz"
    ;;
  *)
    echo "ERROR: Unsupported platform: $OS $ARCH" >&2
    exit 1
    ;;
esac

URL="https://github.com/qdrant/qdrant/releases/download/${QDRANT_VERSION}/${ASSET}"
TMP="$(mktemp -d)"

echo "→ Downloading Qdrant ${QDRANT_VERSION} for ${OS}/${ARCH}"
curl -fsSL "$URL" -o "$TMP/qdrant.tar.gz"
mkdir -p "$INSTALL_DIR/storage"
tar -xzf "$TMP/qdrant.tar.gz" -C "$TMP"
install -m 755 "$TMP/qdrant" "$BINARY"
rm -rf "$TMP"

echo "✓ Installed $BINARY (Qdrant ${QDRANT_VERSION})"
