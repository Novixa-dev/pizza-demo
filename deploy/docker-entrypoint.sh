#!/bin/sh
# Container entrypoint: validate config, back up, sync schema, seed baseline data, start.
set -eu

fail() { echo "[entrypoint] FATAL: $*" >&2; exit 1; }

# --- Required production configuration (the app also refuses insecure fallbacks) ---
[ -n "${SESSION_SECRET:-}" ] || fail "SESSION_SECRET is not set"
[ "$(printf %s "$SESSION_SECRET" | wc -c)" -ge 32 ] || fail "SESSION_SECRET must be at least 32 characters"
for v in ADMIN_PIN KITCHEN_PIN CASHIER_PIN; do
  eval "val=\${$v:-}"
  [ -n "$val" ] || fail "$v is not set"
done

DB_FILE="${DATABASE_URL#file:}"
mkdir -p "$(dirname "$DB_FILE")/backups" /app/storage/receipts

# --- Pre-migration snapshot (online, WAL-safe; keeps the 14 most recent) ---
if [ -s "$DB_FILE" ]; then
  node deploy/db-backup.mjs pre-start 14
fi

# --- Schema sync: refuses destructive changes (no --accept-data-loss) ---
echo "[entrypoint] Syncing database schema…"
node node_modules/prisma/build/index.js db push --skip-generate --schema prisma/schema.prisma

# --- Baseline data: production seeder is a no-op when the restaurant already exists ---
echo "[entrypoint] Ensuring baseline restaurant data…"
node prisma/seed.cjs

echo "[entrypoint] Starting Pizza House on :${PORT:-3000}"
exec "$@"
