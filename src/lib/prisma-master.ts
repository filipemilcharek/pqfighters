import { PrismaClient } from "@/generated/prisma-master/client";

function createMasterClient(): PrismaClient {
  if (process.env.MASTER_TURSO_DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    return new PrismaClient({
      adapter: new PrismaLibSql({
        url: process.env.MASTER_TURSO_DATABASE_URL,
        authToken: process.env.MASTER_TURSO_AUTH_TOKEN,
      }),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.MASTER_DATABASE_URL || "file:./prisma/master.db",
    }),
  });
}

const globalForPrisma = globalThis as unknown as {
  prismaMaster: PrismaClient | undefined;
};

export const prismaMaster =
  globalForPrisma.prismaMaster ?? (() => {
    const client = createMasterClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prismaMaster = client;
    return client;
  })();
