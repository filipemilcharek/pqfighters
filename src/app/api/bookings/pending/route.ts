import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};
  if (date) where.date = date;

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, belt: true, degrees: true, photoUrl: true } },
      privateSlot: true,
      groupClass: true,
    },
    orderBy: [{ date: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(bookings);
}
