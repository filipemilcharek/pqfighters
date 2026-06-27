import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN" || !session.user.isOwner) {
    return NextResponse.json({ error: "Apenas o dono pode editar professores" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target || target.role !== "ADMIN") {
    return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 });
  }
  if (target.isOwner) {
    return NextResponse.json({ error: "Não é possível editar o dono" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.email) data.email = body.email;
  if (body.password) data.passwordHash = await bcrypt.hash(body.password, 10);

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, isOwner: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN" || !session.user.isOwner) {
    return NextResponse.json({ error: "Apenas o dono pode excluir professores" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target || target.role !== "ADMIN") {
    return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 });
  }
  if (target.isOwner) {
    return NextResponse.json({ error: "Não é possível excluir o dono" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
