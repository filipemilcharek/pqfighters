import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; optionId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { optionId } = await params;
  const body = await req.json();
  const { frequency, details, label, price, sortOrder } = body;

  const option = await prisma.planOption.update({
    where: { id: optionId },
    data: {
      ...(frequency !== undefined && { frequency }),
      ...(details !== undefined && { details: details || null }),
      ...(label !== undefined && { label }),
      ...(price !== undefined && { price }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  });

  return NextResponse.json(option);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; optionId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { optionId } = await params;
  await prisma.planOption.delete({ where: { id: optionId } });
  return NextResponse.json({ ok: true });
}
