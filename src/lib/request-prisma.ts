import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { PrismaClient } from "../generated/prisma/client";
import { getTenantPrisma } from "./tenant-prisma";

/**
 * Get the tenant-specific Prisma client from a NextRequest.
 * Reads tenantSlug from the JWT token and returns the correct client.
 */
export async function getRequestPrisma(req: NextRequest): Promise<PrismaClient | null> {
  const token = await getToken({ req });
  if (!token?.tenantSlug) return null;
  return getTenantPrisma(token.tenantSlug);
}
