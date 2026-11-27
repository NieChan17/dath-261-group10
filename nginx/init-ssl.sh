#!/bin/sh
set -eu

# Provision Let's Encrypt TLS certificates for EduPulse production Nginx.
# Usage: DOMAIN_NAME=edupulse.example.com CERTBOT_EMAIL=ops@example.com ./nginx/init-ssl.sh

DOMAIN="${1:-${DOMAIN_NAME:-}}"
EMAIL="${2:-${CERTBOT_EMAIL:-}}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Usage: DOMAIN_NAME=<domain> CERTBOT_EMAIL=<email> $0"
  exit 1
fi

echo "[SSL Init] Requesting Let's Encrypt certificate for domain: $DOMAIN"

docker compose -f "$COMPOSE_FILE" up -d nginx

docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "" certbot \
  certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --non-interactive \
  -d "$DOMAIN"

echo "[SSL Init] Reloading Nginx with provisioned certificate..."
docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload

echo "[SSL Init] TLS setup completed for $DOMAIN."
