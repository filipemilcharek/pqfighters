import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const professors = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      isOwner: true,
      _count: {
        select: {
          instructorClasses: true,
          instructorSlots: true,
        },
      },
    },
    orderBy: [{ isOwner: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(professors);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN" || !session.user.isOwner) {
    return NextResponse.json({ error: "Apenas o dono pode criar professores" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const professor = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      status: "APPROVED",
      isOwner: false,
    },
    select: { id: true, name: true, email: true, isOwner: true },
  });

  return NextResponse.json(professor, { status: 201 });
}
