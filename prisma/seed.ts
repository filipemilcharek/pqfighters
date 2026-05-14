import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@ct.com" },
    update: {},
    create: {
      name: "Admin CT",
      email: "admin@ct.com",
      passwordHash,
      role: "ADMIN",
      studentType: "PARTICULAR",
      belt: "PRETA",
      degrees: 0,
    },
  });

  console.log("Seed completed: admin@ct.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
