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
  const email = process.env.ADMIN_EMAIL || "admin@faixappreta.com.br";
  const password = process.env.ADMIN_PASSWORD || "faixappreta123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Admin",
      email,
      passwordHash,
      role: "ADMIN",
      status: "APPROVED",
      studentType: "PREMIUM",
      belt: "PRETA",
      degrees: 0,
    },
  });

  console.log(`Seed completed: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
