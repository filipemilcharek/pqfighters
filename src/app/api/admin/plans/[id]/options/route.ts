import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { frequency, details, label, price, sortOrder } = body;

  const option = await prisma.planOption.create({
    data: {
      planId: id,
      frequency,
      details: details || null,
      label,
      price,
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json(option);
}
