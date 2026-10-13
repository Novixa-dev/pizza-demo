# Deployment, Environment & Operations Runbook

## 1. Runtime Requirements

- Node.js 24 LTS and npm.
- A single long-running Node.js host with persistent storage. The Prisma schema uses SQLite; PostgreSQL and serverless/multi-instance deployment are not supported by this repository.
- Persistent, backed-up storage for the SQLite database and `storage/receipts/` directory.
- Production values for `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `SESSION_SECRET` (at least 32 bytes), and unique `ADMIN_PIN`, `KITCHEN_PIN`, and `CASHIER_PIN` values. Never use development PINs in production.

Use `.env.example` as the variable-name reference. Generate a signing secret with `openssl rand -hex 32` and keep secrets in the host's secret manager, not in source control.

---

## 2. Deployment Strategies

### Single-instance VPS / Persistent Container
1. Install dependencies from the committed lockfile and build:
   ```bash
   npm ci
   npm run build
   ```
2. Configure `DATABASE_URL` to a persistent SQLite file, then initialize the schema and baseline restaurant/menu data on the first deployment:
   ```bash
   npm run db:push
   npm run db:seed
   ```
   Production seeding skips demo orders and testimonials, and exits without changes if the restaurant already exists. Do not use the development seeder to reset production data.
3. Start the application behind HTTPS:
   ```bash
   npm run start
   ```

Do not run `db:push` against a production database without taking a backup and reviewing the Prisma schema diff first. The project has no committed Prisma migrations; `db:push` is the current schema deployment mechanism.

---

## 3. Backup & Disaster Recovery

- **Production Database**: Schedule verified backups of the persistent SQLite file and test restoration regularly.
- **Receipts Storage**: Back up `storage/receipts/` alongside the database; serve it only through the authenticated receipt API.
