import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL || process.env.DATABASE_URL === "file:./dev.db") {
  const prismaDirDb = path.resolve(process.cwd(), "prisma/dev.db");
  const rootDirDb = path.resolve(process.cwd(), "dev.db");
  if (fs.existsSync(prismaDirDb)) {
    process.env.DATABASE_URL = `file:${prismaDirDb}`;
  } else if (fs.existsSync(rootDirDb)) {
    process.env.DATABASE_URL = `file:${rootDirDb}`;
  } else {
    process.env.DATABASE_URL = `file:${prismaDirDb}`;
  }
}

let prismaClient: PrismaClient;

try {
  prismaClient =
    globalThis.prismaGlobal ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

  // Optimize SQLite for concurrent multi-user access via WAL mode
  if (
    process.env.DATABASE_URL?.includes(".db") ||
    process.env.DATABASE_URL?.startsWith("file:")
  ) {
    prismaClient.$queryRawUnsafe("PRAGMA journal_mode = WAL;").catch(() => {});
    prismaClient.$queryRawUnsafe("PRAGMA busy_timeout = 5000;").catch(() => {});
    prismaClient.$queryRawUnsafe("PRAGMA synchronous = NORMAL;").catch(() => {});
  }
} catch {
  console.warn("[AI Studio] Database not connected — using mock");
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  prismaClient = new Proxy({}, { get: () => noOp }) as any;
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

