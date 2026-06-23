import { PrismaClient } from "../src/generated/prisma/client.ts";
import bcrypt from "bcryptjs";

function createPrismaClient(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    const { createClient } = require("@libsql/client");
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter: new PrismaLibSql(libsql) });
  }

  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || "file:./dev.db",
    }),
  });
}

const prisma = createPrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("pq@portoalegre", 10);

  await prisma.user.upsert({
    where: { email: "pqfighters@gmail.com" },
    update: {},
    create: {
      name: "Patrick",
      email: "pqfighters@gmail.com",
      passwordHash,
      role: "ADMIN",
      status: "APPROVED",
      studentType: "PREMIUM",
      belt: "PRETA",
      degrees: 0,
    },
  });

  console.log("Seed completed: pqfighters@gmail.com / pq@portoalegre");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
