import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { jwtVerify } from "jose";

const intlMiddleware = createMiddleware(routing);

// Secret for JWT verification - must match the one in CookieSessionProvider
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "findeg-admin-secret-key-change-in-production",
);

/**
 *
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the route is an admin route (e.g., /en/admin/...)
  // We check for /admin segment in the path, regardless of locale
  const isAdminRoute = pathname.includes("/admin") && !pathname.includes("/admin-login");

  if (isAdminRoute) {
    const sessionCookie = request.cookies.get("admin_session");

    if (!sessionCookie) {
      // Redirect to login if no session
      // Extract locale from path if present, otherwise default to 'en'
      const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] || "en";
      return NextResponse.redirect(new URL(`/${locale}/admin-login`, request.url));
    }

    try {
      // Verify JWT
      const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);

      // Verify role is admin
      if (payload.role !== "admin") {
        const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] || "en";
        return NextResponse.redirect(new URL(`/${locale}/admin-login`, request.url));
      }
    } catch (error) {
      // Invalid token
      const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] || "en";
      return NextResponse.redirect(new URL(`/${locale}/admin-login`, request.url));
    }
  }

  // 2. If valid admin session or not an admin route, continue with intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
