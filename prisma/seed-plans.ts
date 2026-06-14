import { PrismaClient } from "../src/generated/prisma/client.ts";

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
  await prisma.planOption.deleteMany();
  await prisma.plan.deleteMany();

  const essencial = await prisma.plan.create({
    data: {
      name: "Essencial",
      description: "Aulas coletivas",
      iconHint: "Star",
      color: "orange",
      isKids: false,
      sortOrder: 0,
      options: {
        create: [
          { frequency: "mensal", label: "Mensal", price: "R$229,00", sortOrder: 0 },
          { frequency: "trimestral", label: "Trimestral", price: "R$619,00", sortOrder: 1 },
          { frequency: "semestral", label: "Semestral", price: "R$1.168,00", sortOrder: 2 },
          { frequency: "anual", label: "Anual", price: "R$2.199,00", sortOrder: 3 },
        ],
      },
    },
  });
  console.log("Created:", essencial.name);

  const pro = await prisma.plan.create({
    data: {
      name: "Pro",
      description: "Semi-particular (max 4 alunos)",
      iconHint: "Sparkles",
      color: "blue",
      isKids: false,
      sortOrder: 1,
      options: {
        create: [
          { frequency: "mensal", label: "Mensal", price: "R$289,00", sortOrder: 0 },
          { frequency: "trimestral", label: "Trimestral", price: "R$780,00", sortOrder: 1 },
          { frequency: "semestral", label: "Semestral", price: "R$1.480,00", sortOrder: 2 },
          { frequency: "anual", label: "Anual", price: "R$2.790,00", sortOrder: 3 },
        ],
      },
    },
  });
  console.log("Created:", pro.name);

  const premium = await prisma.plan.create({
    data: {
      name: "Premium",
      description: "Aulas particulares exclusivas",
      iconHint: "Crown",
      color: "amber",
      isKids: false,
      sortOrder: 2,
      options: {
        create: [
          { frequency: "avulsa", details: "aula_avulsa", label: "Aula avulsa", price: "R$120,00", sortOrder: 0 },
          { frequency: "avulsa", details: "pacote_5_aulas", label: "Pacote 5 aulas", price: "R$540,00", sortOrder: 1 },
          { frequency: "avulsa", details: "pacote_10_aulas", label: "Pacote 10 aulas", price: "R$990,00", sortOrder: 2 },
          { frequency: "mensal", details: "1x_semana", label: "Mensal - 1x semana", price: "R$420,00", sortOrder: 3 },
          { frequency: "mensal", details: "2x_semana", label: "Mensal - 2x semana", price: "R$690,00", sortOrder: 4 },
          { frequency: "mensal", details: "3x_semana", label: "Mensal - 3x semana", price: "R$990,00", sortOrder: 5 },
          { frequency: "trimestral", details: "1x_semana", label: "Trimestral - 1x semana", price: "R$1.140,00", sortOrder: 6 },
          { frequency: "trimestral", details: "2x_semana", label: "Trimestral - 2x semana", price: "R$1.890,00", sortOrder: 7 },
          { frequency: "trimestral", details: "3x_semana", label: "Trimestral - 3x semana", price: "R$2.430,00", sortOrder: 8 },
          { frequency: "semestral", details: "1x_semana", label: "Semestral - 1x semana", price: "R$2.160,00", sortOrder: 9 },
          { frequency: "semestral", details: "2x_semana", label: "Semestral - 2x semana", price: "R$3.570,00", sortOrder: 10 },
          { frequency: "semestral", details: "3x_semana", label: "Semestral - 3x semana", price: "R$4.590,00", sortOrder: 11 },
          { frequency: "anual", details: "1x_semana", label: "Anual - 1x semana", price: "R$4.080,00", sortOrder: 12 },
          { frequency: "anual", details: "2x_semana", label: "Anual - 2x semana", price: "R$6.720,00", sortOrder: 13 },
          { frequency: "anual", details: "3x_semana", label: "Anual - 3x semana", price: "R$8.640,00", sortOrder: 14 },
        ],
      },
    },
  });
  console.log("Created:", premium.name);

  const kidsBoxe = await prisma.plan.create({
    data: {
      name: "Boxe",
      description: "Boxe Kids",
      iconHint: "Star",
      color: "orange",
      isKids: true,
      sortOrder: 3,
      options: {
        create: [
          { frequency: "mensal", details: "boxe", label: "Mensal", price: "R$200,00", sortOrder: 0 },
        ],
      },
    },
  });
  console.log("Created:", kidsBoxe.name);

  const kidsJJ = await prisma.plan.create({
    data: {
      name: "Jiu-Jitsu + No-Gi",
      description: "Plano Unico (Jiu-Jitsu + No-Gi)",
      iconHint: "Sparkles",
      color: "blue",
      isKids: true,
      sortOrder: 4,
      options: {
        create: [
          { frequency: "mensal", details: "jiu_jitsu_nogi", label: "Mensal", price: "R$220,00", sortOrder: 0 },
        ],
      },
    },
  });
  console.log("Created:", kidsJJ.name);

  const kidsJJBoxe = await prisma.plan.create({
    data: {
      name: "Jiu-Jitsu + Boxe",
      description: "Jiu-Jitsu + Boxe Kids",
      iconHint: "Crown",
      color: "amber",
      isKids: true,
      sortOrder: 5,
      options: {
        create: [
          { frequency: "mensal", details: "jiu_jitsu_e_boxe", label: "Mensal", price: "R$250,00", sortOrder: 0 },
        ],
      },
    },
  });
  console.log("Created:", kidsJJBoxe.name);

  console.log("Done! All plans seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
