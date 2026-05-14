import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
  });

  if (!booking) {
    return NextResponse.json(
      { error: "Agendamento não encontrado" },
      { status: 404 }
    );
  }

  // Only admin or the booking owner can check in
  if (
    session.user.role !== "ADMIN" &&
    booking.userId !== session.user.id
  ) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  // Check-in only on the day of the class
  const today = format(new Date(), "yyyy-MM-dd");
  if (booking.date !== today) {
    return NextResponse.json(
      { error: "Check-in só pode ser feito no dia da aula" },
      { status: 400 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: { checkedIn: true },
  });

  return NextResponse.json(updated);
}
