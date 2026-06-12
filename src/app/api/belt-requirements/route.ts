import { NextRequest, NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const type = req.nextUrl.searchParams.get("type");

  if (type === "degree") {
    const requirements = await prisma.degreeRequirement.findMany({
      orderBy: [{ belt: "asc" }, { degree: "asc" }],
    });
    return NextResponse.json(requirements);
  }

  const requirements = await prisma.beltRequirement.findMany({
    orderBy: { belt: "asc" },
  });
  return NextResponse.json(requirements);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const type = req.nextUrl.searchParams.get("type");

  if (type === "degree") {
    const body: { belt: string; degree: number; requiredClasses: number }[] = await req.json();

    const results = await Promise.all(
      body.map((item) =>
        prisma.degreeRequirement.upsert({
          where: { belt_degree: { belt: item.belt, degree: item.degree } },
          update: { requiredClasses: item.requiredClasses },
          create: { belt: item.belt, degree: item.degree, requiredClasses: item.requiredClasses },
        })
      )
    );

    return NextResponse.json(results);
  }

  const body: { belt: string; requiredClasses: number }[] = await req.json();

  const results = await Promise.all(
    body.map((item) =>
      prisma.beltRequirement.upsert({
        where: { belt: item.belt },
        update: { requiredClasses: item.requiredClasses },
        create: { belt: item.belt, requiredClasses: item.requiredClasses },
      })
    )
  );

  return NextResponse.json(results);
}
