import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.plan.findMany({
    include: { options: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, iconHint, color, isKids, sortOrder, options } = body;

  const plan = await prisma.plan.create({
    data: {
      name,
      description: description || "",
      iconHint: iconHint || "Star",
      color: color || "orange",
      isKids: isKids || false,
      sortOrder: sortOrder ?? 0,
      options: options?.length
        ? { create: options.map((o: { frequency: string; details?: string; label: string; price: string }, i: number) => ({
            frequency: o.frequency,
            details: o.details || null,
            label: o.label,
            price: o.price,
            sortOrder: i,
          })) }
        : undefined,
    },
    include: { options: true },
  });

  return NextResponse.json(plan);
}
