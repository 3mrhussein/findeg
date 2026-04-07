import { container } from "@features/core/infrastructure/di/ServiceContainer";
import { redirect } from "@i18n/navigation";
import { isAdminSession } from "@features/core/domain/auth/authorization";
import type { SessionPayload } from "@features/core/domain/auth";
import type { Locale } from "next-intl";

/**
 * Require any authenticated user — redirects to /login if not.
 * Use in layouts/pages that require a logged-in user.
 */
export async function requireAuth(locale: Locale): Promise<SessionPayload> {
  const session = await container.authService.getSession();
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
  const session = await container.authService.getSession();
  if (!session || !isAdminSession(session)) {
    redirect({ href: "/admin/login", locale });
  }
  return session!;
}

/**
 * Redirect already-authenticated users away from auth pages.
 * Admins go to /admin, regular users go to /dashboard.
 */
export async function redirectIfAuthenticated(locale: Locale): Promise<void> {
  const session = await container.authService.getSession();
  if (session) {
    if (isAdminSession(session)) {
      redirect({ href: "/admin", locale });
    } else {
      redirect({ href: "/dashboard", locale });
    }
  }
}

/**
 * Get the current session without redirecting.
 * Returns null for guests. Use in public pages with auth-aware components.
 */
export async function getOptionalSession(): Promise<SessionPayload | null> {
  return container.authService.getSession();
}
