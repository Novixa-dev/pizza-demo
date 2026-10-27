#!/usr/bin/env bash
# =============================================================================
# Pizza Demo — one-time (idempotent) VPS bootstrap for pizza-demo.novixa.dev
#
# Run as root on the Contabo VPS (copy the repo's deploy/ folder there first):
#   scp -r deploy root@<VPS_IP>:/root/pizza-demo-deploy
#   LETSENCRYPT_EMAIL=you@novixa.dev bash /root/pizza-demo-deploy/scripts/server-setup.sh
#
# Optional environment overrides:
#   DOMAIN=pizza-demo.novixa.dev   APP_DIR=/opt/pizza-demo   APP_PORT=3066
#   DEPLOY_USER=deploy              LETSENCRYPT_EMAIL=...      CF_API_TOKEN=...
#     CF_API_TOKEN (Cloudflare token with Zone:DNS:Edit on novixa.dev) enables
#     DNS-01 certificates, which keep renewing even when the record is proxied (orange cloud).
#
# Safe to re-run: existing secrets, certificates, data and users are kept.
# =============================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-pizza-demo.novixa.dev}"
APP_DIR="${APP_DIR:-/opt/pizza-demo}"
APP_PORT="${APP_PORT:-3066}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"
CF_API_TOKEN="${CF_API_TOKEN:-}"
REPO_RAW="${REPO_RAW:-https://raw.githubusercontent.com/Novixa-dev/pizza-demo/main}"
APP_UID=1000 # "node" user inside the image

log()  { printf '\n\033[1;33m▶ %s\033[0m\n' "$*"; }
ok()   { printf '  \033[1;32m✔ %s\033[0m\n' "$*"; }
warn() { printf '  \033[1;31m! %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { echo "Run as root (sudo)."; exit 1; }
export DEBIAN_FRONTEND=noninteractive

# ---------------------------------------------------------------------------
log "1/8 System packages"
# Refuse to fight another reverse proxy (Caddy/Traefik/panel) for ports 80/443.
holders="$(ss -ltnpH 2>/dev/null | awk '$4 ~ /:(80|443)$/' | grep -o 'users:(("[^"]*"' | cut -d'"' -f2 | sort -u | grep -vx nginx | tr '\n' ' ' || true)"
if [ -n "${holders// /}" ]; then
  warn "Ports 80/443 are held by: $holders"
  warn "This script manages Nginx. Point your existing proxy at 127.0.0.1:$APP_PORT instead,"
  warn "or re-run with SKIP_PROXY_CHECK=1 if you are sure."
  [ "${SKIP_PROXY_CHECK:-0}" = "1" ] || exit 1
fi
apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg openssl nginx certbot >/dev/null
if [ -n "$CF_API_TOKEN" ]; then apt-get install -y -qq python3-certbot-dns-cloudflare >/dev/null; fi
ok "nginx, certbot installed"

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker >/dev/null
docker compose version >/dev/null 2>&1 || apt-get install -y -qq docker-compose-plugin >/dev/null
ok "$(docker --version)"

# ---------------------------------------------------------------------------
log "2/8 Deploy user '$DEPLOY_USER' (used by GitHub Actions over SSH)"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash "$DEPLOY_USER"
  ok "user created"
fi
usermod -aG docker "$DEPLOY_USER"
DEPLOY_HOME="$(getent passwd "$DEPLOY_USER" | cut -d: -f6)"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$DEPLOY_HOME/.ssh"
touch "$DEPLOY_HOME/.ssh/authorized_keys"
chmod 600 "$DEPLOY_HOME/.ssh/authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_HOME/.ssh/authorized_keys"

KEY_FILE="$DEPLOY_HOME/.ssh/github_actions_ed25519"
NEW_KEY=0
if [ ! -f "$KEY_FILE" ]; then
  ssh-keygen -q -t ed25519 -N "" -C "github-actions@$DOMAIN" -f "$KEY_FILE"
  cat "$KEY_FILE.pub" >> "$DEPLOY_HOME/.ssh/authorized_keys"
  chown "$DEPLOY_USER:$DEPLOY_USER" "$KEY_FILE" "$KEY_FILE.pub"
  NEW_KEY=1
  ok "CI SSH key generated"
else
  ok "CI SSH key already exists"
fi

# ---------------------------------------------------------------------------
log "3/8 Application directory $APP_DIR"
install -d -m 750 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR"
install -d -m 750 -o "$APP_UID" -g "$APP_UID" "$APP_DIR/data" "$APP_DIR/data/backups" "$APP_DIR/storage" "$APP_DIR/storage/receipts"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ ! -f "$APP_DIR/docker-compose.yml" ] && [ -f "$SCRIPT_DIR/../docker-compose.yml" ]; then
  cp "$SCRIPT_DIR/../docker-compose.yml" "$APP_DIR/docker-compose.yml"
fi
if [ ! -f "$APP_DIR/docker-compose.yml" ]; then
  curl -fsSL "$REPO_RAW/deploy/docker-compose.yml" -o "$APP_DIR/docker-compose.yml" \
    || warn "Could not download docker-compose.yml (private repo?) — the first GitHub deploy will upload it."
fi
# The deploy user must be able to overwrite these files on every rollout.
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR/scripts"
[ -f "$APP_DIR/docker-compose.yml" ] && chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/docker-compose.yml"

NEW_ENV=0
if [ ! -f "$APP_DIR/.env" ]; then
  rand_pin() { while :; do p="$(shuf -i 100000-999999 -n 1)"; case "$p" in 123456|111111|000000) ;; *) echo "$p"; return;; esac; done; }
  ADMIN_PIN="$(rand_pin)"; KITCHEN_PIN="$(rand_pin)"; CASHIER_PIN="$(rand_pin)"
  cat > "$APP_DIR/.env" <<EOF
# Pizza Demo production configuration — keep private (chmod 600).
NEXT_PUBLIC_APP_URL=https://$DOMAIN
SESSION_SECRET=$(openssl rand -hex 32)
ADMIN_PIN=$ADMIN_PIN
KITCHEN_PIN=$KITCHEN_PIN
CASHIER_PIN=$CASHIER_PIN
APP_PORT=$APP_PORT
APP_IMAGE=ghcr.io/novixa-dev/pizza-demo
APP_TAG=latest
EOF
  NEW_ENV=1
  ok ".env created with fresh secrets"
else
  ok ".env already exists (secrets kept)"
fi
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

# ---------------------------------------------------------------------------
log "4/8 Cloudflare real-IP snippet"
install -d /etc/nginx/snippets
{
  echo "# Generated by pizza-demo server-setup.sh"
  for ip in $(curl -fsSL https://www.cloudflare.com/ips-v4) $(curl -fsSL https://www.cloudflare.com/ips-v6); do
    echo "set_real_ip_from $ip;"
  done
  echo "real_ip_header CF-Connecting-IP;"
} > /etc/nginx/snippets/cloudflare-realip.conf.new
if grep -q set_real_ip_from /etc/nginx/snippets/cloudflare-realip.conf.new; then
  mv /etc/nginx/snippets/cloudflare-realip.conf.new /etc/nginx/snippets/cloudflare-realip.conf
else
  rm -f /etc/nginx/snippets/cloudflare-realip.conf.new
  [ -f /etc/nginx/snippets/cloudflare-realip.conf ] || echo "# Cloudflare IP list unavailable" > /etc/nginx/snippets/cloudflare-realip.conf
fi
ok "snippet ready"

# ---------------------------------------------------------------------------
# Debian-style sites-enabled when nginx.conf includes it, otherwise conf.d
if grep -Rqs "sites-enabled" /etc/nginx/nginx.conf; then
  install -d /etc/nginx/sites-available /etc/nginx/sites-enabled
  VHOST_FILE="/etc/nginx/sites-available/$DOMAIN.conf"; VHOST_LINK="/etc/nginx/sites-enabled/$DOMAIN.conf"
else
  VHOST_FILE="/etc/nginx/conf.d/$DOMAIN.conf"; VHOST_LINK=""
fi
enable_vhost() { [ -z "$VHOST_LINK" ] || ln -sf "$VHOST_FILE" "$VHOST_LINK"; }

log "5/8 TLS certificate for $DOMAIN"
SSL_CERT=""; SSL_KEY=""
PARENT="${DOMAIN#*.}"
# Re-use an existing certificate that already covers the domain (exact or wildcard).
for dir in /etc/letsencrypt/live/*/; do
  [ -f "$dir/fullchain.pem" ] || continue
  sans="$(openssl x509 -in "$dir/fullchain.pem" -noout -ext subjectAltName 2>/dev/null || true)"
  if echo "$sans" | grep -qE "DNS:($DOMAIN|\*\.$PARENT)(,|$)"; then
    SSL_CERT="${dir}fullchain.pem"; SSL_KEY="${dir}privkey.pem"; break
  fi
done

if [ -z "$SSL_CERT" ]; then
  [ -n "$LETSENCRYPT_EMAIL" ] || { warn "Set LETSENCRYPT_EMAIL=... to issue a certificate."; exit 1; }
  if [ -n "$CF_API_TOKEN" ]; then
    install -d -m 700 /root/.secrets
    printf 'dns_cloudflare_api_token = %s\n' "$CF_API_TOKEN" > /root/.secrets/cloudflare.ini
    chmod 600 /root/.secrets/cloudflare.ini
    certbot certonly --non-interactive --agree-tos -m "$LETSENCRYPT_EMAIL" \
      --dns-cloudflare --dns-cloudflare-credentials /root/.secrets/cloudflare.ini \
      --dns-cloudflare-propagation-seconds 30 -d "$DOMAIN"
  else
    # HTTP-01: needs the DNS record reachable on port 80 (set it to "DNS only"/grey cloud for this step).
    install -d /var/www/certbot
    cat > "$VHOST_FILE" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    location ^~ /.well-known/acme-challenge/ { root /var/www/certbot; default_type "text/plain"; }
    location / { return 404; }
}
EOF
    enable_vhost
    nginx -t && systemctl reload nginx
    certbot certonly --non-interactive --agree-tos -m "$LETSENCRYPT_EMAIL" \
      --webroot -w /var/www/certbot -d "$DOMAIN"
  fi
  SSL_CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
  SSL_KEY="/etc/letsencrypt/live/$DOMAIN/privkey.pem"
fi
ok "certificate: $SSL_CERT"

# Reload nginx after every successful renewal
install -d /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nsystemctl reload nginx\n' > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# ---------------------------------------------------------------------------
log "6/8 Nginx virtual host"
install -d /var/www/certbot
VHOST_SRC="$(mktemp)"
if [ -f "$SCRIPT_DIR/../nginx/pizza-demo.novixa.dev.conf" ]; then
  cp "$SCRIPT_DIR/../nginx/pizza-demo.novixa.dev.conf" "$VHOST_SRC"
else
  curl -fsSL "$REPO_RAW/deploy/nginx/pizza-demo.novixa.dev.conf" -o "$VHOST_SRC"
fi
sed -e "s#__DOMAIN__#$DOMAIN#g" -e "s#__APP_PORT__#$APP_PORT#g" \
    -e "s#__SSL_CERT__#$SSL_CERT#g" -e "s#__SSL_KEY__#$SSL_KEY#g" \
    "$VHOST_SRC" > "$VHOST_FILE"
rm -f "$VHOST_SRC"
enable_vhost
nginx -t
systemctl reload nginx
ok "https://$DOMAIN → 127.0.0.1:$APP_PORT"

if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow 'Nginx Full' >/dev/null && ok "ufw: Nginx Full allowed"
fi

# ---------------------------------------------------------------------------
log "7/8 Nightly database backups"
cat > /etc/cron.d/pizza-demo-backup <<EOF
# Pizza Demo: consistent SQLite snapshot (keeps 30) + weekly receipts archive (keeps 8)
SHELL=/bin/sh
15 3 * * * root docker exec pizza-demo-app node deploy/db-backup.mjs daily 30 >> /var/log/pizza-demo-backup.log 2>&1
45 3 * * 0 root tar -czf $APP_DIR/data/backups/receipts-\$(date +\%Y\%m\%d).tar.gz -C $APP_DIR storage && ls -1t $APP_DIR/data/backups/receipts-*.tar.gz | tail -n +9 | xargs -r rm -f
EOF
chmod 644 /etc/cron.d/pizza-demo-backup
ok "cron installed (/etc/cron.d/pizza-demo-backup)"

# ---------------------------------------------------------------------------
log "8/8 Start (if an image is already published)"
if [ -f "$APP_DIR/docker-compose.yml" ]; then
  (cd "$APP_DIR" && docker compose pull -q 2>/dev/null && docker compose up -d) \
    && ok "container started" \
    || warn "Image not pullable yet — it will be started by the first GitHub Actions deploy."
fi

# ---------------------------------------------------------------------------
echo
echo "=============================================================================="
echo " Pizza Demo server is ready:  https://$DOMAIN"
echo "=============================================================================="
if [ "$NEW_ENV" -eq 1 ]; then
  echo " Staff PINs (store them in a password manager — shown only once):"
  echo "   Admin:   $ADMIN_PIN"
  echo "   Kitchen: $KITCHEN_PIN"
  echo "   Cashier: $CASHIER_PIN"
  echo
fi
echo " Add these GitHub repository secrets (Settings → Secrets and variables → Actions):"
echo "   VPS_HOST     = $(curl -fsS4 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo "   VPS_USER     = $DEPLOY_USER"
echo "   VPS_PORT     = $(sshd -T 2>/dev/null | awk '/^port /{print $2; exit}' || echo 22)"
if [ "$NEW_KEY" -eq 1 ]; then
  echo "   VPS_SSH_KEY  = (the private key below, including the BEGIN/END lines)"
  echo "------------------------------------------------------------------------------"
  cat "$KEY_FILE"
  echo "------------------------------------------------------------------------------"
else
  echo "   VPS_SSH_KEY  = contents of $KEY_FILE"
fi
echo "=============================================================================="
