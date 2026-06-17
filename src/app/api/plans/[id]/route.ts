import { NextRequest, NextResponse } from "next/server";
import { getTenantPrisma, getTenantFlags } from "@/lib/tenant-prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
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
  const body = await req.json();
  const { name, description, price, frequency, planType, monthlyCredits } = body;

  if (planType && !["COLETIVA", "PARTICULAR"].includes(planType)) {
    return NextResponse.json({ error: "Tipo de plano inválido" }, { status: 400 });
  }

  const plan = await prisma.plan.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(frequency !== undefined && { frequency }),
      ...(planType !== undefined && { planType }),
      ...(monthlyCredits !== undefined && { monthlyCredits }),
    },
  });

  return NextResponse.json(plan);
}

export async function DELETE(
  _req: NextRequest,
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

  await prisma.plan.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
