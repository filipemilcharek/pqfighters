import { NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const [pendingStudents, pendingUpgrades] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", status: "PENDING" } }),
    prisma.planUpgradeRequest.count({ where: { status: "PENDING", readByAdmin: false } }),
  ]);

  return NextResponse.json({ pendingStudents, pendingUpgrades });
}
