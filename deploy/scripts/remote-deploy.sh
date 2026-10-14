#!/usr/bin/env bash
# Zero-touch rollout executed on the VPS by the Deploy workflow (as the deploy user).
#   remote-deploy.sh <image> <tag>
# Pulls the image, restarts the stack, waits for the container health check and
# automatically rolls back to the previous tag if the new release is unhealthy.
set -euo pipefail

IMAGE="${1:?usage: remote-deploy.sh <image> <tag>}"
TAG="${2:?usage: remote-deploy.sh <image> <tag>}"
APP_DIR="${APP_DIR:-/opt/pizza-house}"
CONTAINER="pizza-house-app"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-180}"
EDGE_NET="pizza-house-edge"            # shared with mailcow's nginx only
SITE_SRC="$APP_DIR/nginx/pizza-house.mailcow.conf"
SITE_CONF="${SITE_CONF:-/opt/mailcow-dockerized/data/conf/nginx/pizza-house.conf}"

cd "$APP_DIR"
[ -f .env ] || { echo "::error::$APP_DIR/.env is missing — run deploy/scripts/server-setup.sh on the server first."; exit 1; }

set_kv() { # set_kv KEY VALUE  (in .env, which compose also uses for ${VAR} interpolation)
  if grep -q "^$1=" .env; then sed -i "s#^$1=.*#$1=$2#" .env; else printf '%s=%s\n' "$1" "$2" >> .env; fi
}

wait_healthy() {
  local waited=0 status
  while [ "$waited" -lt "$HEALTH_TIMEOUT" ]; do
    status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$CONTAINER" 2>/dev/null || echo missing)"
    case "$status" in
      healthy) return 0 ;;
      unhealthy|exited|dead|missing) [ "$waited" -gt 20 ] && return 1 ;;
    esac
    sleep 5; waited=$((waited + 5))
  done
  return 1
}

nginx_ctr() { docker ps -q --filter label=com.docker.compose.service=nginx-mailcow | head -n1; }

# Install the site block only when it changed; nginx -t first, previous file restored on failure.
sync_site() {
  [ -f "$SITE_SRC" ] || return 0
  cmp -s "$SITE_SRC" "$SITE_CONF" 2>/dev/null && return 0
  local ctr prev; ctr="$(nginx_ctr)"
  [ -n "$ctr" ] || { echo "::warning::mailcow nginx is not running — site block not installed"; return 0; }
  prev="$(mktemp)"; [ -f "$SITE_CONF" ] && cp "$SITE_CONF" "$prev"
  cat "$SITE_SRC" > "$SITE_CONF"
  if docker exec "$ctr" nginx -t >/dev/null 2>&1; then
    docker exec "$ctr" nginx -s reload >/dev/null && echo "✔ nginx site updated and reloaded"
  else
    docker exec "$ctr" nginx -t 2>&1 | tail -5 || true
    if [ -s "$prev" ]; then cat "$prev" > "$SITE_CONF"; else : > "$SITE_CONF"; fi
    echo "::error::nginx -t rejected the new site block — previous file restored, nginx untouched"
  fi
  rm -f "$prev"
}

# The edge network is created once and attached live to mailcow's nginx (no restart).
docker network inspect "$EDGE_NET" >/dev/null 2>&1 || docker network create "$EDGE_NET" >/dev/null
NGINX_CTR="$(nginx_ctr)"
if [ -n "$NGINX_CTR" ] && ! docker inspect -f '{{json .NetworkSettings.Networks}}' "$NGINX_CTR" | grep -q "\"$EDGE_NET\""; then
  docker network connect "$EDGE_NET" "$NGINX_CTR" && echo "✔ mailcow nginx joined $EDGE_NET"
fi

PREV_TAG="$(grep -E '^APP_TAG=' .env | cut -d= -f2- || true)"
echo "▶ Deploying $IMAGE:$TAG (previous: ${PREV_TAG:-none})"

if [ -n "${GHCR_TOKEN:-}" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-github}" --password-stdin >/dev/null
  trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT
fi

set_kv APP_IMAGE "$IMAGE"
set_kv APP_TAG "$TAG"
docker compose pull app
docker compose up -d --remove-orphans app

if wait_healthy; then
  echo "✅ $CONTAINER is healthy on $TAG"
  sync_site
else
  echo "::error::$TAG failed its health check — recent logs:"
  docker compose logs --tail=80 app || true
  if [ -n "$PREV_TAG" ] && [ "$PREV_TAG" != "$TAG" ] && [ "$PREV_TAG" != "latest" ]; then
    echo "↩ Rolling back to $PREV_TAG"
    set_kv APP_TAG "$PREV_TAG"
    docker compose up -d app
    wait_healthy && echo "↩ Rollback to $PREV_TAG is healthy" || echo "::error::Rollback is unhealthy too"
  fi
  exit 1
fi

# Keep the current and previous releases for instant rollback; drop older ones.
docker images "$IMAGE" --format '{{.Tag}}' \
  | grep -vxE "$TAG|${PREV_TAG:-__none__}|latest|<none>" \
  | xargs -r -I{} docker rmi "$IMAGE:{}" >/dev/null 2>&1 || true
docker image prune -f >/dev/null 2>&1 || true
