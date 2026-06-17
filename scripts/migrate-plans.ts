/**
 * Migration script: Simplify plans (ESSENCIAL/PRO/PREMIUM → COLETIVA/PARTICULAR)
 * and add Plan table to all existing tenant DBs.
 *
 * Also adds enablePlans/enableTimer columns to master DB.
 *
 * Usage: npx tsx scripts/migrate-plans.ts
 */

import { PrismaClient as MasterClient } from "../src/generated/prisma-master/client";

function createMasterClient(): MasterClient {
  if (process.env.MASTER_TURSO_DATABASE_URL?.startsWith("libsql://")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    return new MasterClient({
      adapter: new PrismaLibSql({
        url: process.env.MASTER_TURSO_DATABASE_URL,
        authToken: process.env.MASTER_TURSO_AUTH_TOKEN,
      }),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  return new MasterClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.MASTER_DATABASE_URL || "file:./prisma/master.db",
    }),
  });
}

async function executeSql(dbUrl: string, authToken: string | undefined, sql: string) {
  if (dbUrl.startsWith("libsql://")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    const client = createClient({ url: dbUrl, authToken });
    await client.execute(sql);
    client.close();
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    const dbPath = dbUrl.replace("file:", "");
    const db = new Database(dbPath);
    db.exec(sql);
    db.close();
  }
}

async function main() {
  const master = createMasterClient();

  // 1. Migrate master DB: add feature flag columns
  console.log("Migrating master DB...");
  try {
    const masterUrl = process.env.MASTER_TURSO_DATABASE_URL || process.env.MASTER_DATABASE_URL || "file:./prisma/master.db";
    const masterToken = process.env.MASTER_TURSO_AUTH_TOKEN;
    await executeSql(masterUrl, masterToken, `ALTER TABLE "Tenant" ADD COLUMN "enablePlans" INTEGER NOT NULL DEFAULT 1;`);
    console.log("  Added enablePlans column");
  } catch (e: any) {
    if (e.message?.includes("duplicate column")) {
      console.log("  enablePlans column already exists");
    } else {
      console.error("  Error adding enablePlans:", e.message);
    }
  }
  try {
    const masterUrl = process.env.MASTER_TURSO_DATABASE_URL || process.env.MASTER_DATABASE_URL || "file:./prisma/master.db";
    const masterToken = process.env.MASTER_TURSO_AUTH_TOKEN;
    await executeSql(masterUrl, masterToken, `ALTER TABLE "Tenant" ADD COLUMN "enableTimer" INTEGER NOT NULL DEFAULT 1;`);
    console.log("  Added enableTimer column");
  } catch (e: any) {
    if (e.message?.includes("duplicate column")) {
      console.log("  enableTimer column already exists");
    } else {
      console.error("  Error adding enableTimer:", e.message);
    }
  }

  // 2. Migrate tenant DBs
  const tenants = await master.tenant.findMany({
    select: { slug: true, tursoDbUrl: true, tursoAuthToken: true },
  });

  console.log(`\nMigrating ${tenants.length} tenant(s)...`);

  for (const tenant of tenants) {
    console.log(`\n  Tenant: ${tenant.slug}`);
    const token = tenant.tursoDbUrl.startsWith("libsql://") ? tenant.tursoAuthToken : undefined;

    // Create Plan table
    try {
      await executeSql(tenant.tursoDbUrl, token, `
        CREATE TABLE IF NOT EXISTS "Plan" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "description" TEXT NOT NULL DEFAULT '',
          "price" TEXT NOT NULL,
          "frequency" TEXT NOT NULL,
          "planType" TEXT NOT NULL,
          "monthlyCredits" INTEGER NOT NULL DEFAULT 0,
          "isActive" INTEGER NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("    Created Plan table");
    } catch (e: any) {
      console.log("    Plan table already exists or error:", e.message);
    }

    // Add planId column to User
    try {
      await executeSql(tenant.tursoDbUrl, token,
        `ALTER TABLE "User" ADD COLUMN "planId" TEXT;`
      );
      console.log("    Added planId column to User");
    } catch (e: any) {
      if (e.message?.includes("duplicate column")) {
        console.log("    planId column already exists on User");
      } else {
        console.error("    Error adding planId to User:", e.message);
      }
    }

    // Add planId column to PlanUpgradeRequest
    try {
      await executeSql(tenant.tursoDbUrl, token,
        `ALTER TABLE "PlanUpgradeRequest" ADD COLUMN "planId" TEXT;`
      );
      console.log("    Added planId column to PlanUpgradeRequest");
    } catch (e: any) {
      if (e.message?.includes("duplicate column")) {
        console.log("    planId column already exists on PlanUpgradeRequest");
      } else {
        console.error("    Error adding planId to PlanUpgradeRequest:", e.message);
      }
    }

    // Add fixedRoster column to GroupClass
    try {
      await executeSql(tenant.tursoDbUrl, token,
        `ALTER TABLE "GroupClass" ADD COLUMN "fixedRoster" INTEGER NOT NULL DEFAULT 0;`
      );
      console.log("    Added fixedRoster column to GroupClass");
    } catch (e: any) {
      if (e.message?.includes("duplicate column")) {
        console.log("    fixedRoster column already exists on GroupClass");
      } else {
        console.error("    Error adding fixedRoster to GroupClass:", e.message);
      }
    }

    // Create GroupClassEnrollment table
    try {
      await executeSql(tenant.tursoDbUrl, token, `
        CREATE TABLE IF NOT EXISTS "GroupClassEnrollment" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "groupClassId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          FOREIGN KEY ("groupClassId") REFERENCES "GroupClass"("id") ON DELETE CASCADE,
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
        );
      `);
      await executeSql(tenant.tursoDbUrl, token, `
        CREATE UNIQUE INDEX IF NOT EXISTS "GroupClassEnrollment_groupClassId_userId_key"
        ON "GroupClassEnrollment"("groupClassId", "userId");
      `);
      console.log("    Created GroupClassEnrollment table");
    } catch (e: any) {
      console.log("    GroupClassEnrollment table already exists or error:", e.message);
    }

    // Migrate studentType values
    try {
      await executeSql(tenant.tursoDbUrl, token,
        `UPDATE "User" SET "studentType" = 'COLETIVA' WHERE "studentType" = 'ESSENCIAL';`
      );
      await executeSql(tenant.tursoDbUrl, token,
        `UPDATE "User" SET "studentType" = 'PARTICULAR' WHERE "studentType" IN ('PRO', 'PREMIUM');`
      );
      console.log("    Migrated studentType values");
    } catch (e: any) {
      console.error("    Error migrating studentType:", e.message);
    }
  }

  await master.$disconnect();
  console.log("\nDone!");
}

main().catch(console.error);
