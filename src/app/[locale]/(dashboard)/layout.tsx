import React from "react";
import { Sidebar } from "./_components/Sidebar";
import { Topbar } from "./_components/Topbar";

/**
 * Dashboard Layout
 * Wraps all dashboard pages with a sidebar and topbar.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Topbar />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
