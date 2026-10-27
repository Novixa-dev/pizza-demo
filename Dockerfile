# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# Pizza Demo — production image (Next.js standalone + Prisma/SQLite)
# ---------------------------------------------------------------------------
ARG NODE_IMAGE=node:24-bookworm-slim

# ---- deps: install the locked dependency tree once -------------------------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
# Prisma's query engine links against OpenSSL 3
RUN ldconfig -p | grep -q "libssl.so.3" || (apt-get update \
      && apt-get install -y --no-install-recommends openssl \
      && rm -rf /var/lib/apt/lists/*)
COPY package.json package-lock.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ---- builder: compile the app and the production seeder --------------------
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
# Prisma's query engine links against OpenSSL 3
RUN ldconfig -p | grep -q "libssl.so.3" || (apt-get update \
      && apt-get install -y --no-install-recommends openssl \
      && rm -rf /var/lib/apt/lists/*)
ARG NEXT_PUBLIC_APP_URL=https://pizza-demo.novixa.dev
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
  && npx esbuild prisma/seed.ts --bundle --platform=node --target=node24 --format=cjs \
       --packages=external --outfile=prisma/seed.cjs

# ---- runner: minimal, non-root runtime -------------------------------------
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
# Prisma's query engine links against OpenSSL 3
RUN ldconfig -p | grep -q "libssl.so.3" || (apt-get update \
      && apt-get install -y --no-install-recommends openssl \
      && rm -rf /var/lib/apt/lists/*)

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/app/data/pizza-demo.db \
    CHECKPOINT_DISABLE=1 \
    PRISMA_HIDE_UPDATE_MESSAGE=1

# Next.js standalone server, static assets and public files
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
# Prisma schema, CLI + engines (for non-destructive `db push` on boot) and the bundled seeder
COPY --from=builder --chown=node:node /app/prisma/schema.prisma /app/prisma/seed.cjs ./prisma/
COPY --from=builder --chown=node:node /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=node:node /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=node:node deploy/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --chown=node:node deploy/db-backup.mjs ./deploy/db-backup.mjs

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p /app/data/backups /app/storage/receipts \
  && chown -R node:node /app/data /app/storage

USER node
EXPOSE 3000
VOLUME ["/app/data", "/app/storage"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# PID 1 signal handling/zombie reaping is provided by `init: true` in docker-compose.
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
