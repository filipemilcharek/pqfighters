import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};

  if (session.user.role === "STUDENT") {
    where.userId = session.user.id;
  } else if (userId) {
    where.userId = userId;
  }

  if (date) where.date = date;

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, belt: true, degrees: true } },
      privateSlot: true,
      groupClass: true,
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const result = bookingSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { type, privateSlotId, groupClassId, date } = result.data;

  // Rule: COLETIVA students can only book GROUP classes
  if (type === "PRIVATE" && session.user.studentType === "COLETIVA") {
    return NextResponse.json(
      { error: "Alunos de aula coletiva não podem agendar aulas particulares" },
      { status: 403 }
    );
  }

  if (type === "PRIVATE") {
    if (!privateSlotId) {
      return NextResponse.json(
        { error: "Slot obrigatório para aula particular" },
        { status: 400 }
      );
    }

    // Check slot exists and is available
    const slot = await prisma.privateSlot.findUnique({
      where: { id: privateSlotId },
    });
    if (!slot || !slot.isAvailable) {
      return NextResponse.json(
        { error: "Horário não disponível" },
        { status: 400 }
      );
    }

    // Check date matches day of week
    const bookingDate = new Date(date + "T12:00:00");
    if (bookingDate.getDay() !== slot.dayOfWeek) {
      return NextResponse.json(
        { error: "Data não corresponde ao dia da semana do horário" },
        { status: 400 }
      );
    }

    // Unique constraint will handle duplicate booking
    try {
      const booking = await prisma.booking.create({
        data: {
          userId: session.user.id,
          type: "PRIVATE",
          privateSlotId,
          date,
        },
        include: { privateSlot: true },
      });
      return NextResponse.json(booking, { status: 201 });
    } catch {
      return NextResponse.json(
        { error: "Este horário já está reservado nesta data" },
        { status: 409 }
      );
    }
  }

  // GROUP booking
  if (!groupClassId) {
    return NextResponse.json(
      { error: "Aula obrigatória para aula coletiva" },
      { status: 400 }
    );
  }

  const groupClass = await prisma.groupClass.findUnique({
    where: { id: groupClassId },
  });
  if (!groupClass) {
    return NextResponse.json(
      { error: "Aula não encontrada" },
      { status: 404 }
    );
  }

  // Check date matches day of week
  const bookingDate = new Date(date + "T12:00:00");
  if (bookingDate.getDay() !== groupClass.dayOfWeek) {
    return NextResponse.json(
      { error: "Data não corresponde ao dia da semana da aula" },
      { status: 400 }
    );
  }

  // Check capacity
  const currentBookings = await prisma.booking.count({
    where: { groupClassId, date },
  });
  if (currentBookings >= groupClass.capacity) {
    return NextResponse.json(
      { error: "Aula lotada" },
      { status: 409 }
    );
  }

  // Check if already booked
  const existing = await prisma.booking.findFirst({
    where: { userId: session.user.id, groupClassId, date },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Você já está agendado nesta aula" },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      type: "GROUP",
      groupClassId,
      date,
    },
    include: { groupClass: true },
  });

  return NextResponse.json(booking, { status: 201 });
}
