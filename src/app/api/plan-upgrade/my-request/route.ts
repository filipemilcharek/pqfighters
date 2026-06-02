import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const request = await prisma.planUpgradeRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
  });

  return NextResponse.json(request);
}
