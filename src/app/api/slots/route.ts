import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slotSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const where: Record<string, unknown> = {};

  // Students can only see their own slots
  if (session.user.role === "STUDENT") {
    where.userId = session.user.id;
  } else if (userId) {
    where.userId = userId;
  }

  const slots = await prisma.privateSlot.findMany({
    where,
    include: { user: { select: { id: true, name: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const result = slotSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const slot = await prisma.privateSlot.create({
    data: result.data,
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json(slot, { status: 201 });
}
