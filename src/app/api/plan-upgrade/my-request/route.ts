import { NextResponse } from "next/server";
import { getTenantPrisma, getTenantFlags } from "@/lib/tenant-prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const flags = await getTenantFlags(session.user.tenantSlug);
  if (!flags?.enablePlans) {
    return NextResponse.json(null);
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const request = await prisma.planUpgradeRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
  });

  return NextResponse.json(request);
}
