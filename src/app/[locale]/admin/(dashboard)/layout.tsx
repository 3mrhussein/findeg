import { Suspense } from "react";
import { Sidebar } from "../_components/Sidebar";
import { Topbar } from "../_components/Topbar";
import { AdminSessionGate } from "../_components/AdminSessionGate";

/**
 * Protected Admin Dashboard Layout
 */
export default async function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-gray-50/50 animate-pulse">
          <div className="w-64 bg-gray-100 hidden md:block" />
          <div className="flex-1 flex flex-col">
            <div className="h-16 bg-gray-100 border-b" />
            <div className="flex-1 p-6" />
          </div>
        </div>
      }
    >
      <AdminSessionGate locale={locale}>
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
          <Sidebar />
          <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
            <Topbar />
            <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
          </div>
        </div>
      </AdminSessionGate>
    </Suspense>
  );
}
