import { NextRequest, NextResponse } from "next/server";
import { getTenantPrisma, getTenantFlags } from "@/lib/tenant-prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createId } from "@paralleldrive/cuid2";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const flags = await getTenantFlags(session.user.tenantSlug);
  if (!flags?.enablePlans) {
    return NextResponse.json({ error: "Módulo de planos desabilitado" }, { status: 403 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
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

  const { name, description, price, frequency, planType, monthlyCredits } = await req.json();

  if (!name || !price || !frequency || !planType) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  if (!["COLETIVA", "PARTICULAR"].includes(planType)) {
    return NextResponse.json({ error: "Tipo de plano inválido" }, { status: 400 });
  }

  const plan = await prisma.plan.create({
    data: {
      id: createId(),
      name,
      description: description || "",
      price,
      frequency,
      planType,
      monthlyCredits: monthlyCredits || 0,
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
