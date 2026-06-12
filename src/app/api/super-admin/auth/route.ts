import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prismaMaster } from "@/lib/prisma-master";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { SECRET, SUPER_ADMIN_COOKIE } from "@/lib/super-admin-auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha obrigatorios" }, { status: 400 });
  }

  const admin = await prismaMaster.superAdmin.findUnique({ where: { email } });

  if (!admin) {
    return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);

  if (!valid) {
    return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
  }

  const token = await new SignJWT({ sub: admin.id, email: admin.email, role: "SUPER_ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SUPER_ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SUPER_ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
