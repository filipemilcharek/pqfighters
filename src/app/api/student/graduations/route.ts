import { NextRequest, NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const userId =
    session.user.role === "ADMIN" && searchParams.get("userId")
      ? searchParams.get("userId")!
      : session.user.id;

  const logs = await prisma.graduationLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(logs);
}
