import React from "react";
import { redirectIfAuthenticated } from "@lib/auth-guard";
import type { Locale } from "next-intl";

/**
 * Auth Layout — Login, Registration
 *
 * Redirects already-authenticated users to their appropriate homepage:
 * - Admins → /admin
 * - Regular users → /dashboard
 */
export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await redirectIfAuthenticated(locale as Locale);

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">{children}</div>
  );
}
