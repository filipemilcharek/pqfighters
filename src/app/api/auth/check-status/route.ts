import { NextRequest, NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { checkRateLimits } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { email, tenantSlug } = await req.json();

    if (!email || !tenantSlug) {
      return NextResponse.json({ status: "UNKNOWN" });
    }

    const limitCheck = await checkRateLimits(req, {
      email,
      ipLimit: 15,
      emailLimit: 5,
    });
    if (!limitCheck.success) {
      return NextResponse.json({ error: limitCheck.error }, { status: 429 });
    }

    const prisma = await getTenantPrisma(tenantSlug);
    if (!prisma) {
      return NextResponse.json({ status: "UNKNOWN" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { status: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ status: "UNKNOWN" });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ status: "UNVERIFIED" });
    }

    return NextResponse.json({ status: user.status });
  } catch (err) {
    console.error("[Check Status Error]:", err);
    return NextResponse.json({ status: "UNKNOWN", error: "Erro interno no servidor" }, { status: 500 });
  }
}
