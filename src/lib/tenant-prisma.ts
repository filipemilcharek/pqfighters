import { PrismaClient } from "../generated/prisma/client";
import { prismaMaster } from "./prisma-master";

const tenantClients = new Map<string, PrismaClient>();

export async function getTenantPrisma(slug: string): Promise<PrismaClient | null> {
  // Check cache
  const cached = tenantClients.get(slug);
  if (cached) return cached;

  // Look up tenant in master DB
  const tenant = await prismaMaster.tenant.findUnique({
    where: { slug },
    select: { tursoDbUrl: true, tursoAuthToken: true, isActive: true },
  });

  if (!tenant || !tenant.isActive) return null;

  let client: PrismaClient;

  if (tenant.tursoDbUrl.startsWith("libsql://")) {
    // Production: Turso
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    client = new PrismaClient({
      adapter: new PrismaLibSql({
        url: tenant.tursoDbUrl,
        authToken: tenant.tursoAuthToken,
      }),
    });
  } else {
    // Dev: local SQLite file
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    client = new PrismaClient({
      adapter: new PrismaBetterSqlite3({
        url: tenant.tursoDbUrl,
      }),
    });
  }

  tenantClients.set(slug, client);
  return client;
}

/** Get tenant info (colors, name) from master DB */
export async function getTenantInfo(slug: string) {
  return prismaMaster.tenant.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      isActive: true,
      enablePlans: true,
      enableTimer: true,
    },
  });
}

/** Get feature flags for a tenant */
export async function getTenantFlags(slug: string) {
  return prismaMaster.tenant.findUnique({
    where: { slug },
    select: { enablePlans: true, enableTimer: true },
  });
}
