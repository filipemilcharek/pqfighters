import { PrismaClient } from "../src/generated/prisma/client.ts";
import bcrypt from "bcryptjs";

function createPrismaClient(): PrismaClient {
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || "file:./dev.db",
    }),
  });
}

const prisma = createPrismaClient();

async function main() {
  const hash = await bcrypt.hash("123456", 10);

  // 1. Aluno mensal, pagamento recente → Em dia
  await prisma.user.upsert({
    where: { email: "mensal.emdia@test.com" },
    update: {},
    create: {
      name: "João Mensal (Em Dia)",
      email: "mensal.emdia@test.com",
      passwordHash: hash,
      role: "STUDENT",
      status: "APPROVED",
      studentType: "Essencial",
      billingFrequency: "MENSAL",
      monthlyDueDay: 10,
      lastPaymentDate: new Date("2026-06-15"),
      belt: "AZUL",
      degrees: 1,
    },
  });

  // 2. Aluno trimestral, pagamento há 2 meses → Em dia
  await prisma.user.upsert({
    where: { email: "trimestral.emdia@test.com" },
    update: {},
    create: {
      name: "Maria Trimestral (Em Dia)",
      email: "trimestral.emdia@test.com",
      passwordHash: hash,
      role: "STUDENT",
      status: "APPROVED",
      studentType: "Pro",
      billingFrequency: "TRIMESTRAL",
      monthlyDueDay: 5,
      lastPaymentDate: new Date("2026-04-01"),
      belt: "ROXA",
      degrees: 0,
    },
  });

  // 3. Aluno trimestral, pagamento há 4 meses → Atrasado
  await prisma.user.upsert({
    where: { email: "trimestral.atrasado@test.com" },
    update: {},
    create: {
      name: "Carlos Trimestral (Atrasado)",
      email: "trimestral.atrasado@test.com",
      passwordHash: hash,
      role: "STUDENT",
      status: "APPROVED",
      studentType: "Pro",
      billingFrequency: "TRIMESTRAL",
      monthlyDueDay: 10,
      lastPaymentDate: new Date("2026-02-01"),
      belt: "AZUL",
      degrees: 2,
    },
  });

  // 4. Aluno semestral, pagamento há 3 meses → Em dia
  await prisma.user.upsert({
    where: { email: "semestral.emdia@test.com" },
    update: {},
    create: {
      name: "Ana Semestral (Em Dia)",
      email: "semestral.emdia@test.com",
      passwordHash: hash,
      role: "STUDENT",
      status: "APPROVED",
      studentType: "Essencial",
      billingFrequency: "SEMESTRAL",
      monthlyDueDay: 15,
      lastPaymentDate: new Date("2026-03-10"),
      belt: "BRANCA",
      degrees: 3,
    },
  });

  // 5. Aluno novo, sem pagamento, cadastrado ontem → Aguardando
  await prisma.user.upsert({
    where: { email: "novo.aguardando@test.com" },
    update: {},
    create: {
      name: "Pedro Novo (Aguardando)",
      email: "novo.aguardando@test.com",
      passwordHash: hash,
      role: "STUDENT",
      status: "APPROVED",
      studentType: "Essencial",
      billingFrequency: "MENSAL",
      monthlyDueDay: 28,
      lastPaymentDate: null,
      createdAt: new Date("2026-06-21"),
      belt: "BRANCA",
      degrees: 0,
    },
  });

  // 6. Aluno novo, sem pagamento, vencimento já passou → Atrasado
  await prisma.user.upsert({
    where: { email: "novo.atrasado@test.com" },
    update: {},
    create: {
      name: "Lucas Novo (Atrasado)",
      email: "novo.atrasado@test.com",
      passwordHash: hash,
      role: "STUDENT",
      status: "APPROVED",
      studentType: "Essencial",
      billingFrequency: "MENSAL",
      monthlyDueDay: 1,
      lastPaymentDate: null,
      createdAt: new Date("2026-05-15"),
      belt: "BRANCA",
      degrees: 0,
    },
  });

  // 7. Aluno anual, pagamento há 10 meses → Em dia
  await prisma.user.upsert({
    where: { email: "anual.emdia@test.com" },
    update: {},
    create: {
      name: "Fernanda Anual (Em Dia)",
      email: "anual.emdia@test.com",
      passwordHash: hash,
      role: "STUDENT",
      status: "APPROVED",
      studentType: "Premium",
      billingFrequency: "ANUAL",
      monthlyDueDay: 20,
      lastPaymentDate: new Date("2025-09-15"),
      belt: "MARROM",
      degrees: 1,
    },
  });

  // 8. Aluno Kids
  await prisma.user.upsert({
    where: { email: "kids@test.com" },
    update: {},
    create: {
      name: "Sofia Kids",
      email: "kids@test.com",
      passwordHash: hash,
      role: "STUDENT",
      status: "APPROVED",
      studentType: "Jiu-Jitsu + No-Gi",
      billingFrequency: "MENSAL",
      monthlyDueDay: 10,
      lastPaymentDate: new Date("2026-06-08"),
      isKids: true,
      belt: "AMARELA",
      degrees: 0,
    },
  });

  console.log("Test students seeded! All passwords: 123456");
  console.log("");
  console.log("Cenários:");
  console.log("  mensal.emdia@test.com       → Mensal, Em dia");
  console.log("  trimestral.emdia@test.com   → Trimestral, Em dia");
  console.log("  trimestral.atrasado@test.com→ Trimestral, Atrasado");
  console.log("  semestral.emdia@test.com    → Semestral, Em dia");
  console.log("  novo.aguardando@test.com    → Sem pagamento, Aguardando");
  console.log("  novo.atrasado@test.com      → Sem pagamento, Atrasado");
  console.log("  anual.emdia@test.com        → Anual, Em dia");
  console.log("  kids@test.com               → Kids, Mensal");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
