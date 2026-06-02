import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Admin approves upgrade request
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const request = await prisma.planUpgradeRequest.update({
    where: { id },
    data: { status: "APPROVED", readByAdmin: true },
  });

  // Atualizar o plano do aluno
  const planToType: Record<string, string> = {
    Essencial: "ESSENCIAL",
    Pro: "PRO",
    Premium: "PREMIUM",
  };
  const newStudentType = planToType[request.plan] || "ESSENCIAL";

  await prisma.user.update({
    where: { id: request.userId },
    data: { studentType: newStudentType },
  });

  return NextResponse.json(request);
}

// Admin rejects upgrade request
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const request = await prisma.planUpgradeRequest.update({
    where: { id },
    data: { status: "REJECTED", readByAdmin: true },
  });

  return NextResponse.json(request);
}
