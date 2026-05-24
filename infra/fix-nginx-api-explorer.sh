#!/usr/bin/env bash
# Patch live nginx so /api-explorer is not swallowed by location /api/ → /v1/explorer
set -euo pipefail

CONF="${1:-/etc/nginx/sites-available/db.zizka.ai}"

if grep -q 'location \^~ /api-explorer' "$CONF" 2>/dev/null; then
  echo "Already patched: $CONF"
  exit 0
fi

sudo cp "$CONF" "${CONF}.bak.$(date +%Y%m%d%H%M%S)"

sudo tee /tmp/zizka-api-explorer.conf >/dev/null <<'NGINX'
    location ^~ /api-explorer {
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

NGINX

# Insert before "location /api/" or "location /v1/"
if grep -q 'location /api/' "$CONF"; then
  sudo sed -i '/location \/api\//r /tmp/zizka-api-explorer.conf' "$CONF"
elif grep -q 'location /v1/' "$CONF"; then
  sudo sed -i '/location \/v1\//r /tmp/zizka-api-explorer.conf' "$CONF"
else
  echo "Could not find insertion point in $CONF" >&2
  exit 1
fi

sudo nginx -t
sudo systemctl reload nginx
echo "Done. Test: curl -sI https://db.zizka.ai/api-explorer | head -3"
