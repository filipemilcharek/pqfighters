import { NextRequest, NextResponse } from "next/server";
import { getTenantInfo } from "@/lib/tenant-prisma";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const tenant = await getTenantInfo(slug);
  if (!tenant || !tenant.isActive) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: tenant.name,
    slug: tenant.slug,
    logoUrl: tenant.logoUrl,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    enablePlans: tenant.enablePlans,
    enableTimer: tenant.enableTimer,
  });
}
