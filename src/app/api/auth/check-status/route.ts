import { NextRequest, NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/tenant-prisma";

export async function POST(req: NextRequest) {
  const { email, tenantSlug } = await req.json();
  if (!email || !tenantSlug) {
    return NextResponse.json({ status: "UNKNOWN" });
  }

  const prisma = await getTenantPrisma(tenantSlug);
  if (!prisma) {
    return NextResponse.json({ status: "UNKNOWN" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { status: true },
  });

  if (!user) {
    return NextResponse.json({ status: "UNKNOWN" });
  }

  return NextResponse.json({ status: user.status });
}
