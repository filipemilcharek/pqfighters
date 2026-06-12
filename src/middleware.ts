import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SITE_HOSTNAMES = ["faixappreta.com.br", "www.faixappreta.com.br"];

function isSiteRequest(req: NextRequest): boolean {
  const hostname = req.headers.get("host")?.split(":")[0] ?? "";
  if (SITE_HOSTNAMES.includes(hostname)) return true;
  if (hostname === "localhost") {
    if (req.nextUrl.searchParams.has("site")) return true;
    if (req.cookies.get("site_mode")?.value === "1") return true;
  }
  return false;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Super admin routes protection
  if (pathname.startsWith("/super-admin") && !pathname.startsWith("/super-admin/login")) {
    const token = req.cookies.get("super-admin-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/super-admin/login", req.url));
    }
    try {
      const secret = new TextEncoder().encode(
        process.env.SUPER_ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET || "super-admin-secret-dev"
      );
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/super-admin/login", req.url));
    }
  }

  // Site institucional: rewrite to /site/...
  if (isSiteRequest(req)) {
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/site/") ||
      pathname === "/logo.png"
    ) {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = `/site${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.rewrite(url);
    if (req.headers.get("host")?.startsWith("localhost")) {
      response.cookies.set("site_mode", "1", { path: "/", maxAge: 60 * 60 });
    }
    return response;
  }

  // Dashboard auth: only protect /admin and /student
  if (pathname.startsWith("/admin") || pathname.startsWith("/student")) {
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student", req.url));
    }

    if (pathname.startsWith("/student") && token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|uploads).*)",
  ],
};
