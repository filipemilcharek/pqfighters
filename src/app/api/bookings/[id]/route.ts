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

  await prisma.booking.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
