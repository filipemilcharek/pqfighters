import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.SUPER_ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET || "super-admin-secret-dev"
);

export const SUPER_ADMIN_COOKIE = "super-admin-token";

export async function verifySuperAdmin(): Promise<{ id: string; email: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SUPER_ADMIN_COOKIE)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== "SUPER_ADMIN") return null;

    return { id: payload.sub as string, email: payload.email as string };
  } catch {
    return null;
  }
}

export { SECRET };
