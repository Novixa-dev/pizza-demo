// Consistent online SQLite snapshot using `VACUUM INTO` (safe while the app is running in WAL mode).
// Usage: node deploy/db-backup.mjs [label=manual] [keep=30]
import { PrismaClient } from "@prisma/client";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const label = (process.argv[2] || "manual").replace(/[^a-z0-9-]/gi, "");
const keep = Number(process.argv[3] || 30);
const dbFile = (process.env.DATABASE_URL || "").replace(/^file:/, "");
if (!dbFile) {
  console.error("[backup] DATABASE_URL is not set");
  process.exit(1);
}

const dir = path.join(path.dirname(dbFile), "backups");
await mkdir(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z");
const target = path.join(dir, `${label}-${stamp}.db`);

const prisma = new PrismaClient();
try {
  await prisma.$executeRawUnsafe(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  const { size } = await stat(target);
  console.log(`[backup] Saved ${target} (${(size / 1024).toFixed(1)} KiB)`);

  const old = (await readdir(dir)).filter((f) => f.startsWith(`${label}-`) && f.endsWith(".db")).sort().reverse();
  for (const f of old.slice(keep)) await rm(path.join(dir, f));
} catch (err) {
  console.error("[backup] Failed:", err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
