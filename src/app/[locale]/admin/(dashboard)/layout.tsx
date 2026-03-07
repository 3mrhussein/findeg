import { Suspense } from "react";
import { Sidebar } from "../_components/Sidebar";
import { Topbar } from "../_components/Topbar";
import { requireAdmin } from "@/lib/auth-guard";
import { PermissionsProvider } from "@/providers/PermissionsProvider";
import type { Locale } from "next-intl";

/**
 * Protected Admin Dashboard Layout
 *
 * This layout guards all admin pages (except /admin/login) behind
 * an admin session check. It also renders the admin shell (sidebar + topbar)
 * and provides PermissionsProvider for client-side permission checks.
 */
export default async function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireAdmin(locale as Locale);

  return (
    <PermissionsProvider session={session}>
      <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <Suspense fallback={<div className="w-64 shrink-0" />}>
          <Sidebar />
        </Suspense>
        <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
          <Topbar />
          <main className="flex-1 p-6 overflow-x-hidden">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </PermissionsProvider>
  );
}
