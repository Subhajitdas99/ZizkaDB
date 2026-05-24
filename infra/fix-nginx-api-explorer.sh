#!/usr/bin/env bash
# Insert /swagger and /api-explorer at SERVER level (not inside location /api/v1/).
set -euo pipefail

BLOCK_FILE=$(mktemp)
cat > "$BLOCK_FILE" <<'NGINX'

    # ZizkaDB API docs (must be before location /api/ — see infra/nginx.conf)
    location ^~ /api-explorer {
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

NGINX

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
  exit 1
fi

echo "Using: $CONF"

if grep -q 'location \^~ /swagger' "$CONF"; then
  echo "Already has location ^~ /swagger"
  rm -f "$BLOCK_FILE"
  exit 0
fi

sudo cp "$CONF" "${CONF}.bak.$(date +%Y%m%d%H%M%S)"

# Insert after ssl_dhparam line (server block, before any location)
if grep -q 'ssl_dhparam' "$CONF"; then
  sudo sed -i "/ssl_dhparam/r $BLOCK_FILE" "$CONF"
elif grep -q 'listen 443 ssl' "$CONF"; then
  sudo sed -i "/listen 443 ssl/r $BLOCK_FILE" "$CONF"
else
  echo "Could not find ssl_dhparam or listen 443 in $CONF" >&2
  rm -f "$BLOCK_FILE"
  exit 1
fi

rm -f "$BLOCK_FILE"
sudo nginx -t
sudo systemctl reload nginx
echo "OK: https://db.zizka.ai/swagger"
