"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Tag,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { useState } from "react";
import { logoutAction } from "@/features/identity/application/actions/auth";
import { useTranslations } from "next-intl";
import { usePermissions } from "@/providers/PermissionsProvider";
import { PERMISSION_CODES } from "@/features/core/domain/auth/authorization";

/**
 *
 */
export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("Pages.Dashboard");

  const { hasPermission } = usePermissions();

  const sidebarItems = [
    {
      title: t("Sidebar.Dashboard"),
      href: "/admin",
      icon: LayoutDashboard,
      show: hasPermission(PERMISSION_CODES.ADMIN_DASHBOARD_READ),
    },
    {
      title: t("Sidebar.Products"),
      href: "/admin/products",
      icon: Package,
      show: hasPermission(PERMISSION_CODES.ADMIN_PRODUCTS_READ),
    },
    {
      title: t("Sidebar.SearchAnalytics"),
      href: "/admin/editorial/search-analytics",
      icon: Search,
      show: hasPermission(PERMISSION_CODES.ADMIN_PRODUCTS_READ),
      isSubItem: true,
    },
    {
      title: t("Sidebar.Categories"),
      href: "/admin/categories",
      icon: FolderTree,
      show: hasPermission(PERMISSION_CODES.ADMIN_CATEGORIES_READ),
    },
    {
      title: t("Sidebar.Tags"),
      href: "/admin/catalog/tags",
      icon: Tag,
      show: hasPermission(PERMISSION_CODES.ADMIN_TAGS_READ),
      isSubItem: true,
    },
    {
      title: t("Sidebar.Collections"),
      href: "/admin/catalog/collections",
      icon: LayoutDashboard,
      show: hasPermission(PERMISSION_CODES.ADMIN_COLLECTIONS_READ),
      isSubItem: true,
    },
    {
      title: t("Sidebar.Brands"),
      href: "/admin/brands",
      icon: Tag,
      show: hasPermission(PERMISSION_CODES.ADMIN_BRANDS_READ),
    },
    {
      title: t("Sidebar.Orders"),
      href: "/admin/orders",
      icon: ShoppingCart,
      show: hasPermission(PERMISSION_CODES.ADMIN_ORDERS_READ),
    },
    {
      title: t("Sidebar.Inventory"),
      href: "/admin/inventory",
      icon: FolderTree,
      show: hasPermission(PERMISSION_CODES.ADMIN_INVENTORY_READ),
    },
    {
      title: t("Sidebar.Media"),
      href: "/admin/media",
      icon: LayoutDashboard,
      show: hasPermission(PERMISSION_CODES.ADMIN_MEDIA_READ),
    },
    {
      title: t("Sidebar.AuditLog"),
      href: "/admin/audit-log",
      icon: LayoutDashboard,
      show: hasPermission(PERMISSION_CODES.ADMIN_AUDIT_LOG_READ),
    },
    {
      title: t("Sidebar.AdminUsers"),
      href: "/admin/users",
      icon: Users,
      show: hasPermission(PERMISSION_CODES.ADMIN_USERS_READ),
    },
    {
      title: t("Sidebar.Settings"),
      href: "/admin/settings",
      icon: Settings,
      show: hasPermission(PERMISSION_CODES.ADMIN_PORTAL),
    },
  ].filter((item) => item.show);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background z-40 flex items-center px-4">
        <IconTooltip label="Toggle admin menu" asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle admin menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </IconTooltip>
        <span className="ms-4 font-semibold">FindEg Admin</span>
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 ease-in-out pt-16 md:pt-0",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="hidden md:flex h-16 items-center border-b px-4 justify-between">
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight text-primary">FindEg</span>
          )}
          <IconTooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="ms-auto"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </IconTooltip>
        </div>

        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  collapsed && "justify-center px-2",
                  item.isSubItem && !collapsed && "ms-4 text-[0.8rem] opacity-80",
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <form action={logoutAction}>
            <Button
              variant="outline"
              className={cn("w-full gap-2", collapsed && "justify-center px-0")}
              type="submit"
              title={collapsed ? t("Topbar.Logout") : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{t("Topbar.Logout")}</span>}
            </Button>
          </form>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
