import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { JwtSessionManager } from "@/features/core/infrastructure/auth/JwtSessionManager";

const intlMiddleware = createMiddleware(routing);
const sessionManager = new JwtSessionManager();

/**
 * Page-level Proxy/Guard
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the route is an admin route (e.g., /en/admin/...)
  const isAdminRoute = pathname.includes("/admin") && !pathname.includes("/admin-login");

  if (isAdminRoute) {
    const session = await sessionManager.validateSession(request);

    if (!session || !sessionManager.authorizeAdmin(session)) {
      // Redirect to login if no session or not admin
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
