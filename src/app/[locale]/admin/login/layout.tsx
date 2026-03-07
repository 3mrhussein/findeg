import { redirectIfAuthenticated } from "@/lib/auth-guard";
import type { Locale } from "next-intl";

/**
 * Admin Login Layout
 *
 * Ensures that already-logged-in admins are redirected to the dashboard
 * instead of being shown the login page again.
 */
export default async function AdminLoginLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await redirectIfAuthenticated(locale as Locale);

  return <>{children}</>;
}
