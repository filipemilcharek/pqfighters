import { NextResponse } from "next/server";
import { getTenantPrisma, getTenantFlags } from "@/lib/tenant-prisma";
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

  const flags = await getTenantFlags(session.user.tenantSlug);
  if (!flags?.enablePlans) {
    return NextResponse.json({ error: "Módulo de planos desabilitado" }, { status: 403 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const { id } = await params;

  const request = await prisma.planUpgradeRequest.update({
    where: { id },
    data: { status: "APPROVED", readByAdmin: true },
  });

  // Buscar o Plan pelo planId (preferido) ou pelo nome (fallback)
  const plan = request.planId
    ? await prisma.plan.findUnique({ where: { id: request.planId } })
    : await prisma.plan.findFirst({ where: { name: request.plan } });

  const newStudentType = plan?.planType || "COLETIVA";
  const newCredits = plan?.monthlyCredits ?? 0;

  await prisma.user.update({
    where: { id: request.userId },
    data: {
      studentType: newStudentType,
      monthlyCredits: newCredits,
      planId: plan?.id || null,
    },
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

  const flags = await getTenantFlags(session.user.tenantSlug);
  if (!flags?.enablePlans) {
    return NextResponse.json({ error: "Módulo de planos desabilitado" }, { status: 403 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const { id } = await params;

  const request = await prisma.planUpgradeRequest.update({
    where: { id },
    data: { status: "REJECTED", readByAdmin: true },
  });

  return NextResponse.json(request);
}
