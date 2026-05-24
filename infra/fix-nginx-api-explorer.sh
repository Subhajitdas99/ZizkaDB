#!/usr/bin/env bash
# Patch nginx: /api-explorer must not hit location /api/ → /v1/explorer
set -euo pipefail

BLOCK='    location ^~ /api-explorer {
        proxy_pass         http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    location ^~ /swagger {
        proxy_pass         http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    location = /openapi.json {
        proxy_pass         http://127.0.0.1:8000/openapi.json;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

'

if [ "${1:-}" != "" ]; then
  CONF="$1"
else
  CONF=$(grep -rl "db\.zizka\.ai\|agentdb\.zizka\.ai" /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | head -1 || true)
  if [ -z "$CONF" ]; then
    CONF=$(ls /etc/nginx/sites-enabled/* 2>/dev/null | head -1 || true)
  fi
fi

if [ -z "$CONF" ] || [ ! -f "$CONF" ]; then
  echo "Could not find nginx config. Usage: $0 /path/to/site.conf" >&2
  echo "Find with: sudo nginx -T | grep server_name" >&2
  exit 1
fi

echo "Using: $CONF"

if grep -q 'location \^~ /api-explorer' "$CONF" && grep -q 'location \^~ /swagger' "$CONF"; then
  echo "Already patched."
  exit 0
fi

sudo cp "$CONF" "${CONF}.bak.$(date +%Y%m%d%H%M%S)"
TMP=$(mktemp)
echo "$BLOCK" > "$TMP"

if grep -q 'location /api/' "$CONF"; then
  sudo sed -i "/location \/api\//r $TMP" "$CONF"
elif grep -q 'location /v1/' "$CONF"; then
  sudo sed -i "/location \/v1\//r $TMP" "$CONF"
else
  echo "No location /api/ or /v1/ found in $CONF" >&2
  exit 1
fi

rm -f "$TMP"
sudo nginx -t
sudo systemctl reload nginx
echo "Done."
echo "  https://db.zizka.ai/swagger"
echo "  https://db.zizka.ai/api-explorer (redirect)"
