import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { userId, type, date, groupClassId, privateSlotId } = await req.json();

  if (!userId || !type || !date) {
    return NextResponse.json({ error: "Campos obrigatórios: userId, type, date" }, { status: 400 });
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      type,
      date,
      groupClassId: type === "GROUP" ? groupClassId : null,
      privateSlotId: type === "PRIVATE" ? privateSlotId : null,
      checkedIn: true,
      status: "CONFIRMED",
    },
    include: { groupClass: true, privateSlot: true },
  });

  return NextResponse.json(booking, { status: 201 });
}
