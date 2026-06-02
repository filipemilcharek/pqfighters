import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Student creates upgrade request
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { plan, frequency, details, price } = await req.json();

  if (!plan || !frequency || !price) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  // Check if there's already a pending request
  const existing = await prisma.planUpgradeRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Você já tem uma solicitação pendente" },
      { status: 409 }
    );
  }

  const request = await prisma.planUpgradeRequest.create({
    data: {
      userId: session.user.id,
      plan,
      frequency,
      details: details || null,
      price,
    },
  });

  return NextResponse.json(request, { status: 201 });
}

// Admin lists pending upgrade requests
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const requests = await prisma.planUpgradeRequest.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: { id: true, name: true, email: true, photoUrl: true, studentType: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}
