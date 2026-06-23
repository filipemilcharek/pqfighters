import { NextRequest, NextResponse } from "next/server";
import { prismaMaster } from "@/lib/prisma-master";
import { verifySuperAdmin } from "@/lib/super-admin-auth";
import { isTursoConfigured, createDatabase, createAuthToken } from "@/lib/turso-api";
import { migrateTenantDatabase } from "@/lib/migrate-tenant";
import { join } from "path";

export async function GET() {
  const admin = await verifySuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const tenants = await prismaMaster.tenant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      adminEmail: true,
      primaryColor: true,
      isActive: true,
      enablePlans: true,
      enableTimer: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ tenants });
}

export async function POST(req: NextRequest) {
  const admin = await verifySuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug, adminName, adminEmail, adminPassword, logoUrl, primaryColor, secondaryColor } = body;

  // Validate required fields
  if (!name || !slug || !adminName || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: "Campos obrigatorios faltando" }, { status: 400 });
  }

  if (adminPassword.length < 6) {
    return NextResponse.json({ error: "Senha deve ter no minimo 6 caracteres" }, { status: 400 });
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Slug invalido. Use apenas letras minusculas, numeros e hifens" }, { status: 400 });
  }

  // Check unique slug
  const existing = await prismaMaster.tenant.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Ja existe um CT com este dominio" }, { status: 409 });
  }

  const dbName = `faixappreta-${slug}`;

  try {
    let dbUrl: string;
    let authToken: string;

    if (isTursoConfigured()) {
      // Production: create database on Turso
      const { database } = await createDatabase(dbName);
      dbUrl = `libsql://${database.Hostname}`;
      const tokenRes = await createAuthToken(dbName);
      authToken = tokenRes.jwt;
    } else {
      // Dev: create local SQLite file
      const dbPath = join(process.cwd(), `prisma/tenants/${slug}.db`);
      dbUrl = `file:${dbPath}`;
      authToken = "local-dev";

      // Ensure tenants directory exists
      const { mkdirSync } = await import("fs");
      mkdirSync(join(process.cwd(), "prisma/tenants"), { recursive: true });
    }

    // Migrate tenant database (create tables, admin user, seed data)
    await migrateTenantDatabase(
      dbUrl,
      isTursoConfigured() ? authToken : undefined,
      {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      }
    );

    // Save tenant in master database
    const tenant = await prismaMaster.tenant.create({
      data: {
        name,
        slug,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || "#f97316",
        secondaryColor: secondaryColor || "#ea580c",
        adminName,
        adminEmail,
        tursoDbUrl: dbUrl,
        tursoAuthToken: authToken,
      },
    });

    // Send verification email to the tenant admin
    try {
      const crypto = await import("crypto");
      const emailToken = crypto.randomInt(100000, 1000000).toString();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const { getTenantPrisma } = await import("@/lib/tenant-prisma");
      const tenantPrisma = await getTenantPrisma(slug);
      if (tenantPrisma) {
        await tenantPrisma.verificationToken.create({
          data: {
            email: adminEmail,
            token: emailToken,
            expiresAt,
          },
        });

        const { sendVerificationEmail } = await import("@/lib/mail");
        await sendVerificationEmail(adminEmail, adminName, emailToken, slug);
      }
    } catch (mailErr) {
      console.error("Error sending verification email to admin:", mailErr);
      // Do not block tenant creation if email sending fails
    }

    return NextResponse.json({
      ok: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        url: `${slug}.faixappreta.com.br`,
      },
    });
  } catch (err) {
    console.error("Error creating tenant:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar CT" },
      { status: 500 }
    );
  }
}
