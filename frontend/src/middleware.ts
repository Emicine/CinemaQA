import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/reservations", "/profile"];
// Routes requiring ROLE_SUPER_ADMIN
const SUPER_ADMIN_ROUTES = ["/admin"];
// Routes requiring ROLE_THEATRE_ADMIN or higher
const THEATRE_ADMIN_ROUTES = ["/theatre-admin"];

function decodeToken(token: string): { ROLES?: Array<{ authority: string }> } | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64").toString());
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("rc_token")?.value;

  // Redirect to home if no token and trying to access protected page
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isSuperAdminRoute = SUPER_ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isTheatreAdminRoute = THEATRE_ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if ((isProtected || isSuperAdminRoute || isTheatreAdminRoute) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("authRequired", "1");
    return NextResponse.redirect(url);
  }

  if (token && (isSuperAdminRoute || isTheatreAdminRoute)) {
    const decoded = decodeToken(token);
    const role = decoded?.ROLES?.[0]?.authority ?? "";

    if (isSuperAdminRoute && role !== "ROLE_SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (
      isTheatreAdminRoute &&
      role !== "ROLE_THEATRE_ADMIN" &&
      role !== "ROLE_SUPER_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/theatre-admin/:path*",
    "/reservations/:path*",
    "/profile/:path*",
  ],
};
