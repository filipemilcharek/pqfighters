import { NextResponse, NextRequest } from "next/server";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { notificationSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reads: session.user.role === "STUDENT"
        ? { where: { userId: session.user.id } }
        : false,
    },
  });

  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const prisma = await getTenantPrisma(session.user.tenantSlug);
  if (!prisma) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const body = await req.json();
  const result = notificationSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const notification = await prisma.notification.create({
    data: {
      ...result.data,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(notification, { status: 201 });
}
