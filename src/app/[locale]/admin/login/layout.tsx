import { redirectIfAuthenticated } from "@/lib/auth-guard";
import type { Locale } from "next-intl";
import { Suspense } from "react";

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

  return (
    <Suspense>
      <AuthGuard locale={locale as Locale}>{children}</AuthGuard>
    </Suspense>
  );
}

async function AuthGuard({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  await redirectIfAuthenticated(locale);
  return <>{children}</>;
}
