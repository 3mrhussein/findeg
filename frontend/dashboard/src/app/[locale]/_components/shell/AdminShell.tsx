import * as React from 'react';
import { Suspense } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminBreadcrumb } from './AdminBreadcrumb';
import { SidebarProvider } from './SidebarContext';
import { AdminSidebarUser } from './AdminSidebarUser';
import { AdminSidebarNav } from './AdminSidebarNav';
import { AdminHeaderUser } from './AdminHeaderUser';
import { AdminHeaderNotifications } from './AdminHeaderNotifications';
import { Skeleton } from '@findeg/ui';
import { SessionProvider } from '@providers/SessionProvider';
import { PermissionsProvider } from '@providers/PermissionsProvider';
import { AdminSessionGate } from '../AdminSessionGate';

export interface AdminShellProps {
  children: React.ReactNode;
  locale?: string;
}

/**
 * AdminShell - Root shell component for the admin dashboard.
 * Refactored to support PPR by decoupling dynamic session data into slots.
 * Wraps itself in default providers to allow static pre-rendering of nav items.
 */
export function AdminShell({
  children,
  locale = 'en',
}: AdminShellProps) {
  return (
    <SessionProvider session={null}>
      <PermissionsProvider session={null}>
        <SidebarProvider>
          <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-950 overflow-hidden font-sans">
            {/* Left Sidebar - Static Structure */}
            <AdminSidebar
              locale={locale}
              navSlot={
                <Suspense fallback={
                  <div className="flex-1 p-4 space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                }>
                  <AdminSessionGate locale={locale}>
                    <AdminSidebarNav locale={locale} />
                  </AdminSessionGate>
                </Suspense>
              }
              userSlot={
                <Suspense fallback={
                  <div className="mt-auto border-t border-gray-200 dark:border-slate-800 p-[12px] flex flex-col shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="h-[32px] w-[32px] rounded-full" />
                      <div className="flex flex-col gap-2 flex-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2 w-24" />
                      </div>
                    </div>
                  </div>
                }>
                  <AdminSidebarUser locale={locale} />
                </Suspense>
              }
            />

            {/* Right Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden relative">
              {/* Header - Static Structure */}
              <AdminHeader 
                locale={locale} 
                userSlot={
                  <Suspense fallback={
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-[32px] w-[32px] rounded-full" />
                    </div>
                  }>
                    <AdminHeaderUser locale={locale} />
                  </Suspense>
                }
                notificationSlot={
                  <Suspense fallback={<Skeleton className="h-[36px] w-[36px] rounded-md" />}>
                    <AdminHeaderNotifications locale={locale} />
                  </Suspense>
                }
              />

              {/* Scrollable Content Container */}
              <main className="flex-1 overflow-y-auto flex flex-col relative w-full">
                <div className="sticky top-0 z-30 border-b border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-sm transition-all duration-300">
                  <Suspense fallback={<div className="h-[40px]" />}>
                    <AdminBreadcrumb locale={locale} />
                  </Suspense>
                </div>
                <div className="flex-1 w-full p-6 lg:p-8">{children}</div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </PermissionsProvider>
    </SessionProvider>
  );
}
