import * as React from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { SidebarProvider } from "./SidebarContext";
import { logoutAction } from "@/features/identity/application/actions/auth";

export interface AdminShellProps {
  children: React.ReactNode;
  locale?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
}

export function AdminShell({
  children,
  locale = "en",
  userEmail,
  userName,
  userRole,
}: AdminShellProps) {
  const handleLogout = async () => {
    "use server";
    await logoutAction();
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-950 overflow-hidden font-sans">
        {/* Left Sidebar */}
        <AdminSidebar
          userEmail={userEmail}
          userName={userName}
          userRole={userRole}
          locale={locale}
        />

        {/* Right Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          {/* Header */}
          <AdminHeader userEmail={userEmail} userName={userName} locale={locale} />

          {/* Scrollable Content Container */}
          <main className="flex-1 overflow-y-auto flex flex-col relative w-full">
            <div className="sticky top-0 z-30 border-b border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-sm transition-all duration-300">
              <AdminBreadcrumb locale={locale} />
            </div>
            <div className="flex-1 w-full p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
