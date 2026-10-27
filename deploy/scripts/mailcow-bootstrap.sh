#!/usr/bin/env bash
# ==============================================================================
# Pizza Demo — one-time (idempotent) bootstrap on the SHARED mailcow VPS.
# Additive only: user "pizza", /opt/pizza-demo, docker network pizza-demo-edge,
# and data/conf/nginx/pizza-demo.conf (nginx -t before reload). It never
# restarts mailcow or touches the novixa / aqar-demo sites.
#
# From a machine with the repo:
#   scp deploy/nginx/pizza-demo.mailcow.conf root@161.97.75.64:/root/
#   ssh root@161.97.75.64 "bash -s -- '<deploy public key>'" < deploy/scripts/mailcow-bootstrap.sh
# ==============================================================================
set -euo pipefail
PUBKEY="$1"
U=pizza
APP=/opt/pizza-demo
MC=/opt/mailcow-dockerized
NG=$MC/data/conf/nginx
NET=pizza-demo-edge

# 1. user
id "$U" >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash "$U"
usermod -aG docker "$U"
H="$(getent passwd "$U" | cut -d: -f6)"
install -d -m 700 -o "$U" -g "$U" "$H/.ssh"
touch "$H/.ssh/authorized_keys"
grep -qF "$PUBKEY" "$H/.ssh/authorized_keys" || echo "no-port-forwarding,no-agent-forwarding,no-X11-forwarding $PUBKEY" >> "$H/.ssh/authorized_keys"
chmod 600 "$H/.ssh/authorized_keys"; chown "$U:$U" "$H/.ssh/authorized_keys"
echo "✔ user $U"

# 2. app dir
install -d -m 750 -o "$U" -g "$U" "$APP" "$APP/scripts" "$APP/nginx"
install -d -m 750 -o 1000 -g 1000 "$APP/data" "$APP/data/backups" "$APP/storage" "$APP/storage/receipts"
if [ ! -f "$APP/.env" ]; then
  rand_pin() { while :; do p="$(shuf -i 100000-999999 -n 1)"; case "$p" in 123456|111111|000000) ;; *) echo "$p"; return;; esac; done; }
  cat > "$APP/.env" <<EOF
# Pizza Demo production configuration — keep private (chmod 600).
NEXT_PUBLIC_APP_URL=https://pizza-demo.novixa.dev
SESSION_SECRET=$(openssl rand -hex 32)
ADMIN_PIN=$(rand_pin)
KITCHEN_PIN=$(rand_pin)
CASHIER_PIN=$(rand_pin)
APP_PORT=3066
APP_IMAGE=ghcr.io/novixa-dev/pizza-demo
APP_TAG=latest
EOF
  echo "✔ .env created"
fi
chown "$U:$U" "$APP/.env"; chmod 600 "$APP/.env"

# 3. docker network, attached live to mailcow nginx (no restart)
docker network inspect "$NET" >/dev/null 2>&1 || docker network create "$NET" >/dev/null
NGINX_CTR="$(docker ps -q --filter label=com.docker.compose.service=nginx-mailcow | head -n1)"
docker inspect -f '{{json .NetworkSettings.Networks}}' "$NGINX_CTR" | grep -q "\"$NET\"" || docker network connect "$NET" "$NGINX_CTR"
echo "✔ network $NET attached to mailcow nginx"

# 4. persist that attachment across mailcow recreation (override file), validated
OV=$MC/docker-compose.override.yml
if ! grep -q "$NET" "$OV"; then
  cp -a "$OV" "$OV.bak-$(date +%Y%m%d%H%M%S)"
  python3 - "$OV" "$NET" <<'PY'
import sys
p, net = sys.argv[1], sys.argv[2]
s = open(p).read()
a = "      aqar-edge: {}\n"
b = "  aqar-edge:\n    external: true\n"
assert s.count(a) == 1 and s.count(b) == 1, "unexpected override layout"
s = s.replace(a, a + f"      {net}: {{}}\n").replace(b, b + f"  {net}:\n    external: true\n")
open(p, "w").write(s)
PY
  if (cd "$MC" && docker compose config -q); then
    echo "✔ override updated and validated"
  else
    cp -a "$(ls -1t $OV.bak-* | head -1)" "$OV"; echo "! override invalid — restored"; exit 1
  fi
fi

# 5. TLS (Cloudflare origin cert *.novixa.dev, own copy) + nginx site
install -d -m 750 -o "$U" -g root "$NG/pizza-demo"
if [ ! -f "$NG/pizza-demo/origin.pem" ]; then
  install -m 600 -o "$U" -g "$U" "$NG/aqar-demo/origin.pem" "$NG/pizza-demo/origin.pem"
  install -m 600 -o "$U" -g "$U" "$NG/aqar-demo/origin.key" "$NG/pizza-demo/origin.key"
fi
if [ ! -s "$NG/pizza-demo.conf" ]; then
  install -m 644 -o "$U" -g "$U" /root/pizza-demo.mailcow.conf "$NG/pizza-demo.conf"
  if docker exec "$NGINX_CTR" nginx -t >/dev/null 2>&1; then
    docker exec "$NGINX_CTR" nginx -s reload && echo "✔ nginx site installed and reloaded"
  else
    docker exec "$NGINX_CTR" nginx -t 2>&1 | tail -5
    rm -f "$NG/pizza-demo.conf"; echo "! nginx -t failed — site removed, nginx untouched"; exit 1
  fi
fi
chown "$U:$U" "$NG/pizza-demo.conf"
install -m 644 -o "$U" -g "$U" /root/pizza-demo.mailcow.conf "$APP/nginx/pizza-demo.mailcow.conf"

# 6. nightly backups
cat > /etc/cron.d/pizza-demo-backup <<EOF
# Pizza Demo: consistent SQLite snapshot (keeps 30) + weekly receipts archive (keeps 8)
SHELL=/bin/sh
15 3 * * * root docker exec pizza-demo-app node deploy/db-backup.mjs daily 30 >> /var/log/pizza-demo-backup.log 2>&1
45 3 * * 0 root tar -czf $APP/data/backups/receipts-\$(date +\%Y\%m\%d).tar.gz -C $APP storage && ls -1t $APP/data/backups/receipts-*.tar.gz | tail -n +9 | xargs -r rm -f
EOF
chmod 644 /etc/cron.d/pizza-demo-backup
rm -f /root/pizza-demo.mailcow.conf
echo "✔ done"
