import { redirect } from "@i18n/navigation";
import { isAdminSession } from "@backend/features/core";
import type { SessionPayload } from "@backend/features/core";
import type { Locale } from "next-intl";
import { getSession } from "@lib/session";

/**
 * Require any authenticated user — redirects to /login if not.
 * Use in layouts/pages that require a logged-in user.
 */
export async function requireAuth(locale: Locale): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect({ href: "/login", locale });
  }
  return session!;
}

/**
 * Require admin session — redirects to /admin/login if not.
 * Use in the (admin) protected layout.
 */
export async function requireAdmin(locale: Locale): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || !isAdminSession(session)) {
    redirect({ href: "/login", locale });
  }
  return session!;
}

/**
 * Redirect already-authenticated users away from auth pages.
 * Admins go to /admin, regular users go to /dashboard.
 */
export async function redirectIfAuthenticated(locale: Locale): Promise<void> {
  const session = await getSession();
  if (session) {
    if (isAdminSession(session)) {
      redirect({ href: "/", locale });
    } else {
      redirect({ href: "/", locale });
    }
  }
}

/**
 * Get the current session without redirecting.
 * Returns null for guests. Use in public pages with auth-aware components.
 */
export async function getOptionalSession(): Promise<SessionPayload | null> {
  return await getSession();
}
