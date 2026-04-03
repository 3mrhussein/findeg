/**
 * DashboardContent
 *
 * Thin layout shell composing:
 * - SidebarProvider (shadcn — handles mobile/desktop, cookie persistence)
 * - DashboardSidebar (nav items, logo, toggles)
 * - SidebarInset (main content area)
 * - DashboardHeader (trigger, page title, contextual actions)
 * - DashboardToast (global notification listener)
 */

"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Icon } from "@/components/shared/Icon";
import { Overview } from "./Overview";
import { Products } from "./Products";
import { Orders } from "./Orders";
import { Customers } from "./Customers";
import { SchoolLists } from "./SchoolLists";
import { TeamView } from "./Team";
import { SettingsView } from "./Settings";
import { DashboardToast } from "./DashboardToast";
import { DashboardSidebar, type DashboardView } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { Order } from "@/features/order/domain/entities/Order";
import type { SchoolListResult } from "@/features/catalog/application/interfaces/ISchoolListRepository";
import { usePermissions } from "@/providers/PermissionsProvider";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

interface DashboardContentProps {
  products: Product[];
  orders: Order[];
  schoolLists: SchoolListResult[];
}

/**
 *
 */
export const DashboardContent: React.FC<DashboardContentProps> = ({
  products,
  orders,
  schoolLists,
}) => {
  const t = useTranslations("Pages.Dashboard");
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const { hasPermission } = usePermissions();

  // Build the set of permitted views to resolve fallback
  const permittedViews: DashboardView[] = [
    hasPermission(PERMISSION_CODES.ADMIN_DASHBOARD_READ) && "overview",
    hasPermission(PERMISSION_CODES.ADMIN_PRODUCTS_READ) && "products",
    hasPermission(PERMISSION_CODES.ADMIN_INVENTORY_READ) && "inventory",
    hasPermission(PERMISSION_CODES.ADMIN_ORDERS_READ) && "orders",
    hasPermission(PERMISSION_CODES.ADMIN_USERS_READ) && "customers",
    hasPermission(PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ) && "school_lists",
    hasPermission(PERMISSION_CODES.ADMIN_MEDIA_READ) && "media",
    hasPermission(PERMISSION_CODES.ADMIN_USERS_READ) && "team",
    hasPermission(PERMISSION_CODES.ADMIN_ROLES_READ) && "settings",
  ].filter(Boolean) as DashboardView[];

  const resolvedView = permittedViews.includes(activeView)
    ? activeView
    : (permittedViews[0] ?? "overview");

  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar activeView={resolvedView} onNavigate={setActiveView} />
        <SidebarInset>
          <DashboardHeader activeView={resolvedView} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {resolvedView === "products" && <Products products={products} />}
            {resolvedView === "orders" && <Orders orders={orders} />}
            {resolvedView === "customers" && <Customers />}
            {resolvedView === "school_lists" && <SchoolLists schoolLists={schoolLists} />}
            {resolvedView === "inventory" && (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                <Icon name="inventory_2" style={{ fontSize: 48 }} />
                <p className="text-lg font-medium">{t("Inventory")}</p>
                <p className="text-sm">{t("ComingSoon")}</p>
              </div>
            )}
            {resolvedView === "media" && (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                <Icon name="image" style={{ fontSize: 48 }} />
                <p className="text-lg font-medium">{t("Media")}</p>
                <p className="text-sm">{t("ComingSoon")}</p>
              </div>
            )}
            {resolvedView === "team" && <TeamView />}
            {resolvedView === "settings" && <SettingsView />}
            {resolvedView === "overview" && <Overview products={products} orders={orders} />}
          </main>
        </SidebarInset>
        <DashboardToast />
      </SidebarProvider>
    </TooltipProvider>
  );
};
