import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [pendingStudents, pendingUpgrades] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", status: "PENDING" } }),
    prisma.planUpgradeRequest.count({ where: { status: "PENDING", readByAdmin: false } }),
  ]);

  return NextResponse.json({ pendingStudents, pendingUpgrades });
}
