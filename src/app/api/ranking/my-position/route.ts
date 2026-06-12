import { NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  // Mês vigente no fuso de Brasília (UTC-3)
  const now = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const monthPrefix = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const users = await prisma.user.findMany({
    where: { role: "STUDENT", status: "APPROVED" },
    select: {
      id: true,
      _count: {
        select: {
          bookings: { where: { checkinStatus: "PRESENTE", date: { startsWith: monthPrefix } } },
        },
      },
    },
  });

  const ranked = users
    .map((u) => ({
      id: u.id,
      presences: u._count.bookings,
    }))
    .filter((u) => u.presences > 0)
    .sort((a, b) => b.presences - a.presences);

  const position = ranked.findIndex((u) => u.id === session.user.id) + 1;
  const total = ranked.length;
  const myPresences = ranked.find((u) => u.id === session.user.id)?.presences ?? 0;

  return NextResponse.json({ position, total, presences: myPresences });
}
