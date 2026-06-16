import { NextRequest, NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET enrollments for a class
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const { id } = await params;

  const enrollments = await prisma.groupClassEnrollment.findMany({
    where: { groupClassId: id },
    include: { user: { select: { id: true, name: true, photoUrl: true, belt: true } } },
  });

  return NextResponse.json(enrollments);
}

// POST - add student to class
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const { id } = await params;
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });
  }

  // Check if already enrolled
  const existing = await prisma.groupClassEnrollment.findUnique({
    where: { groupClassId_userId: { groupClassId: id, userId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Aluno já matriculado nesta aula" }, { status: 409 });
  }

  const enrollment = await prisma.groupClassEnrollment.create({
    data: { groupClassId: id, userId },
    include: { user: { select: { id: true, name: true, photoUrl: true, belt: true } } },
  });

  return NextResponse.json(enrollment, { status: 201 });
}

// DELETE - remove student from class
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const { id } = await params;
  const { userId } = await req.json();

  await prisma.groupClassEnrollment.delete({
    where: { groupClassId_userId: { groupClassId: id, userId } },
  });

  return NextResponse.json({ ok: true });
}
