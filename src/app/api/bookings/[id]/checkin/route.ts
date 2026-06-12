import { NextRequest, NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
const VALID_STATUSES = ["PRESENTE", "CANCELADO", "AUSENTE"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
  });

  if (!booking) {
    return NextResponse.json(
      { error: "Agendamento não encontrado" },
      { status: 404 }
    );
  }

  // Only admin can set checkin status
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { checkinStatus } = body;

  if (checkinStatus && !VALID_STATUSES.includes(checkinStatus)) {
    return NextResponse.json(
      { error: "Status inválido. Use: PRESENTE, CANCELADO ou AUSENTE" },
      { status: 400 }
    );
  }

  // If checkinStatus provided, set it; if null, clear it (reset to pending)
  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: {
      checkinStatus: checkinStatus || null,
      checkedIn: checkinStatus === "PRESENTE",
    },
    include: {
      user: { select: { id: true, name: true, belt: true, degrees: true, photoUrl: true } },
      privateSlot: true,
      groupClass: true,
    },
  });

  return NextResponse.json(updated);
}
