# Deployment & Operations Runbook — `pizza-demo.novixa.dev`

Production runs as a single Docker container on the Novixa Contabo VPS, behind Nginx (TLS) and Cloudflare (DNS/CDN).
Every push to `main` is verified, built into an image, published to GHCR and rolled out automatically.

```
Browser ──HTTPS──▶ Cloudflare (proxied DNS) ──HTTPS──▶ Nginx :443 on VPS ──HTTP──▶ 127.0.0.1:3066 ─▶ container :3000
                                                                                   ├─ /opt/pizza-demo/data     (SQLite + backups)
                                                                                   └─ /opt/pizza-demo/storage  (payment receipts)
```

| Piece | Where |
|---|---|
| Image | `ghcr.io/novixa-dev/pizza-demo:<sha-xxxxxxx>` (+ `latest`) — built by `.github/workflows/deploy.yml` |
| Stack | `/opt/pizza-demo/docker-compose.yml` (source: `deploy/docker-compose.yml`) |
| Secrets | `/opt/pizza-demo/.env` (chmod 600, created once by `server-setup.sh`) |
| Vhost | `/etc/nginx/sites-available/pizza-demo.novixa.dev.conf` (source: `deploy/nginx/…`) |
| Backups | `/opt/pizza-demo/data/backups/` — nightly `daily-*.db` (30 kept), `pre-start-*.db` before every boot (14 kept), weekly `receipts-*.tar.gz` (8 kept) |
| Health | `GET /api/health` → `{"status":"ok","db":"ok"}` (used by Docker, the deploy job and uptime monitors) |

---

> **Current production host (161.97.75.64) is shared** with mailcow, novixa.dev and aqar-demo. Mailcow's nginx owns ports 80/443, so `server-setup.sh` (which installs its own Nginx) is **not** used there. Instead:
> - bootstrap once with `deploy/scripts/mailcow-bootstrap.sh` (see its header) — adds the `pizza` user, `/opt/pizza-demo`, the `pizza-demo-edge` network and mailcow's `data/conf/nginx/pizza-demo.conf`;
> - TLS is the Cloudflare Origin certificate for `*.novixa.dev` (Cloudflare SSL mode *Full (strict)*, record proxied);
> - every deploy re-attaches mailcow's nginx to `pizza-demo-edge` and syncs `deploy/nginx/pizza-demo.mailcow.conf` (with `nginx -t` + restore on failure).
> The sections below describe a dedicated VPS.

## 1. One-time setup (≈10 minutes)

### 1.1 Cloudflare DNS
In **Cloudflare → novixa.dev → DNS → Add record**:

| Type | Name | Content | Proxy |
|---|---|---|---|
| `A` | `pizza-demo` | *VPS public IPv4* | **DNS only (grey)** for the first certificate if you are not using a Cloudflare API token; switch to **Proxied (orange)** afterwards |

SSL/TLS mode for the zone must be **Full (strict)**.

> Prefer a fully automatic setup? Create a Cloudflare API token (*My Profile → API Tokens → Edit zone DNS*, zone `novixa.dev`) and pass it as `CF_API_TOKEN` below. Certificates are then issued and renewed through DNS-01 and the record can stay orange-clouded at all times.

### 1.2 Bootstrap the VPS (as root)
The repository is private, so copy the `deploy/` folder to the server from a machine that has the repo checked out:
```bash
scp -r deploy root@<VPS_IP>:/root/pizza-demo-deploy
ssh root@<VPS_IP>
LETSENCRYPT_EMAIL=admin@novixa.dev bash /root/pizza-demo-deploy/scripts/server-setup.sh
# or, with Cloudflare DNS-01 (record can stay orange-clouded):
LETSENCRYPT_EMAIL=admin@novixa.dev CF_API_TOKEN=xxxxxxxx bash /root/pizza-demo-deploy/scripts/server-setup.sh
```
(If the repository is ever made public, `curl -fsSL https://raw.githubusercontent.com/Novixa-dev/pizza-demo/main/deploy/scripts/server-setup.sh` works too.)

The script is idempotent and never overwrites existing secrets, data or certificates. It:
1. installs Docker, Nginx and Certbot (aborts if another proxy such as Caddy/Traefik owns ports 80/443);
2. creates the `deploy` user (docker group) and an SSH key dedicated to GitHub Actions;
3. creates `/opt/pizza-demo/{data,storage}` and a `.env` with a random `SESSION_SECRET` and random 6-digit staff PINs;
4. reuses an existing certificate covering the domain (including a `*.novixa.dev` wildcard) or issues a new one;
5. installs the Nginx vhost (HTTP→HTTPS, HSTS, gzip, SSE-friendly `/api/orders/stream`, Cloudflare real-IP);
6. installs the nightly backup cron;
7. prints the **staff PINs** and the **GitHub secrets** to add.

### 1.3 GitHub repository secrets
*Settings → Secrets and variables → Actions → New repository secret*:

| Secret | Value |
|---|---|
| `PIZZA_DEMO_SSH_KEY` | private key of the `pizza` user (whole block incl. `BEGIN/END`) |
| `PIZZA_DEMO_SSH_KEY_PASSWORD` | passphrase of that key (leave empty if it has none) |
| `PIZZA_DEMO_HOST` / `PIZZA_DEMO_USER` / `PIZZA_DEMO_PORT` | optional overrides — the workflow defaults to `161.97.75.64`, `pizza`, `22` |

Optionally create a **production** environment (*Settings → Environments*) with required reviewers to gate deploys.

### 1.4 First deploy
Merge to `main` (or *Actions → Deploy → Run workflow*). The pipeline runs:

1. **CI** — `npm ci`, schema push + seed into a throwaway DB, `lint`, `typecheck`, 86+ tests, production build;
2. **Image** — multi-stage Docker build (non-root, Next standalone), pushed to GHCR with `sha-<commit>` and `latest` tags, layer cache in GitHub Actions;
3. **Deploy** — uploads the compose stack over SSH, runs `remote-deploy.sh`: pull → restart → wait for the health check → **automatic rollback to the previous tag** if unhealthy;
4. **Smoke test** — `https://pizza-demo.novixa.dev/api/health`, `/` and `/menu` from the public internet.

On boot the container snapshots the database, applies the Prisma schema with `db push` (**destructive changes are refused** — no `--accept-data-loss`), and runs the production seeder, which only creates the restaurant/menu baseline on an empty database.

---

## 2. Day-2 operations

```bash
cd /opt/pizza-demo
docker compose ps                         # status + health
docker compose logs -f --tail=200 app     # application logs
docker compose restart app                # restart (snapshot taken automatically)
docker exec pizza-demo-app node deploy/db-backup.mjs manual 50   # on-demand backup
```

**Roll back** to any previous release: *Actions → Deploy → Run workflow* with `image_tag = sha-xxxxxxx`, or on the server:
```bash
bash /opt/pizza-demo/scripts/remote-deploy.sh ghcr.io/novixa-dev/pizza-demo sha-xxxxxxx
```

**Restore a backup**:
```bash
cd /opt/pizza-demo && docker compose stop app
cp data/pizza-demo.db data/backups/before-restore-$(date +%s).db
cp data/backups/daily-YYYYMMDDTHHMMSSZ.db data/pizza-demo.db && rm -f data/pizza-demo.db-wal data/pizza-demo.db-shm
docker compose up -d app
```

**Find the staff PINs** (`/admin` accepts the admin PIN; `/kitchen` the kitchen or admin PIN): `ssh root@<VPS_IP> "grep _PIN= /opt/pizza-demo/.env"`. The admin PIN unlocks every staff screen. Five wrong attempts lock that IP out for 15 minutes.

**Rotate staff PINs / session secret**: edit `/opt/pizza-demo/.env`, then `docker compose up -d app`. Changing `SESSION_SECRET` signs every staff member out.

**Off-site copies**: sync `/opt/pizza-demo/data/backups/` to object storage (e.g. `rclone sync` to Contabo Object Storage or Cloudflare R2) from cron.

---

## 3. Local production parity

```bash
docker build -t pizza-demo:local .
docker run --rm -p 3000:3000 --init \
  -e SESSION_SECRET=$(openssl rand -hex 32) -e ADMIN_PIN=135790 -e KITCHEN_PIN=246800 -e CASHIER_PIN=112233 \
  -v "$PWD/.local-data:/app/data" pizza-demo:local
```

## 4. Constraints
- SQLite + local receipt storage ⇒ **one** app instance. Do not scale the service horizontally.
- The Prisma schema has no migration history; `db push` is the schema mechanism. Review schema diffs in PRs; data-losing changes need a manual, backed-up migration.
