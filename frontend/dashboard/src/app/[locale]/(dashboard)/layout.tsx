import { Suspense } from 'react';
import { AdminSessionGate } from '../_components/AdminSessionGate';

/**
 * Generate static params for supported locales
 */
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

/**
 * Protected Admin Dashboard Layout
 *
 * Uses the new AdminShell component for consistent admin navigation and layout.
 * AdminSessionGate handles authentication and wraps content in AdminShell.
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
        <div className="flex h-screen bg-background">
          <div className="w-[240px] border-e bg-sidebar animate-pulse" />
          <div className="flex flex-1 flex-col">
            <div className="h-16 border-b bg-background animate-pulse" />
            <div className="flex-1 p-6" />
          </div>
        </div>
      }
    >
      <AdminSessionGate locale={locale}>{children}</AdminSessionGate>
    </Suspense>
  );
}
