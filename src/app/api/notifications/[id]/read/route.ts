import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await prisma.notificationRead.create({
      data: {
        notificationId: params.id,
        userId: session.user.id,
      },
    });
  } catch {
    // Already read - ignore unique constraint violation
  }

  return NextResponse.json({ ok: true });
}
