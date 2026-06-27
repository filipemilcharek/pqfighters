import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const SITE_HOSTNAMES = ["pqfighters.com.br", "www.pqfighters.com.br"];

function isSiteRequest(req: NextRequest): boolean {
  const hostname = req.headers.get("host")?.split(":")[0] ?? "";
  if (SITE_HOSTNAMES.includes(hostname)) return true;
  // Localhost: ?site=1 sets a cookie, so subsequent navigations keep working
  if (hostname === "localhost") {
    if (req.nextUrl.searchParams.has("site")) return true;
    if (req.cookies.get("site_mode")?.value === "1") return true;
  }
  return false;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
    // Set cookie on localhost so internal <a> links keep working without ?site=1
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

    // Professors (non-owner admins): redirect /admin to /admin/agenda
    if (pathname === "/admin" && token.role === "ADMIN" && !token.isOwner) {
      return NextResponse.redirect(new URL("/admin/agenda", req.url));
    }

    if (pathname.startsWith("/student") && token.role === "ADMIN") {
      return NextResponse.redirect(new URL(token.isOwner ? "/admin" : "/admin/agenda", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|uploads|site/).*)",
  ],
};
