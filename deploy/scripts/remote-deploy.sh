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
