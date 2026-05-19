import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { privateSlot: true },
  });

  if (!booking) {
    return NextResponse.json(
      { error: "Agendamento não encontrado" },
      { status: 404 }
    );
  }

  if (
    session.user.role !== "ADMIN" &&
    booking.userId !== session.user.id
  ) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  // Students cancelling private bookings: must be 12h before class time
  if (session.user.role !== "ADMIN" && booking.type === "PRIVATE" && booking.privateSlot) {
    const classDateTime = new Date(`${booking.date}T${booking.privateSlot.startTime}:00`);
    const now = new Date();
    const hoursUntilClass = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilClass < 12) {
      return NextResponse.json(
        { error: "Cancelamento permitido até 12 horas antes do horário da aula" },
        { status: 403 }
      );
    }
  }

  // Students cannot cancel bound private slots (admin-controlled)
  if (session.user.role !== "ADMIN" && booking.type === "PRIVATE" && booking.privateSlot?.userId) {
    return NextResponse.json(
      { error: "Aulas particulares vinculadas são controladas pelo professor" },
      { status: 403 }
    );
  }

  await prisma.booking.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
