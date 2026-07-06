#!/usr/bin/env bash
# Stop native ZizkaDB stack (Qdrant, API, dashboard) using PID files from restart-native-stack.sh.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

stop_pid() {
  local name="$1"
  local pidfile="$2"
  if [ ! -f "$pidfile" ]; then
    return 0
  fi
  local pid
  pid="$(cat "$pidfile")"
  if kill -0 "$pid" 2>/dev/null; then
    echo "→ Stopping $name (pid $pid)"
    kill "$pid" 2>/dev/null || true
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  fi
  rm -f "$pidfile"
}

stop_pid "Qdrant" ".local/pids/qdrant.pid"
stop_pid "API" ".local/pids/api.pid"
stop_pid "Dashboard" ".local/pids/dashboard.pid"

for port in 6333 8000 3001; do
  if lsof -ti ":$port" >/dev/null 2>&1; then
    echo "WARN: Something still listening on :$port (not started via restart-native-stack.sh?)"
    echo "      Stop it manually if needed: lsof -ti :$port | xargs kill"
  fi
done

echo "✓ Native stack stopped"
