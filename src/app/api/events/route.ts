import { NextRequest, NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { eventSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: { createdBy: { select: { name: true } } },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const body = await req.json();
  const result = eventSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const event = await prisma.event.create({
    data: {
      ...result.data,
      description: result.data.description || "",
      createdById: session.user.id,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
