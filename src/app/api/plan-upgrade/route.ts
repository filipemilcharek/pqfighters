import { NextResponse } from "next/server";
import { getTenantPrisma, getTenantFlags } from "@/lib/tenant-prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Student creates upgrade request
export async function POST(req: Request) {
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

  const { planId, plan, frequency, details, price } = await req.json();

  if (!plan || !frequency || !price) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  // Validate: check if the requested plan has the same type as current studentType
  if (planId) {
    const targetPlan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { planType: true },
    });
    if (targetPlan && targetPlan.planType === session.user.studentType) {
      return NextResponse.json(
        { error: "Você já está em um plano do mesmo tipo" },
        { status: 400 }
      );
    }
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
      planId: planId || null,
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

  const flags = await getTenantFlags(session.user.tenantSlug);
  if (!flags?.enablePlans) {
    return NextResponse.json({ error: "Módulo de planos desabilitado" }, { status: 403 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

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
