/**
 * DashboardSidebar
 *
 * Built on shadcn <Sidebar> primitives.
 * - Desktop: collapsible icon-mode sidebar with tooltips
 * - Mobile: auto Sheet drawer via useIsMobile()
 * - RTL: handled by Sidebar's `side` prop
 * - Permission-gated nav items
 */

"use client";

import React from "react";
import { useRouter } from "@i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Logo } from "@ui";
import { Icon } from "@ui";
import { PERMISSION_CODES } from "@features/core/domain/auth";
import { usePermissions } from "@providers/PermissionsProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@ui";
import { ToggleTheme } from "@ui";
import ToggleLanguage from "@components/shared/ToggleLanguage";

type DashboardView =
  | "overview"
  | "products"
  | "orders"
  | "customers"
  | "school_lists"
  | "inventory"
  | "media"
  | "team"
  | "settings";

interface NavItem {
  id: DashboardView;
  label: string;
  icon: string;
  permission: string;
}

interface DashboardSidebarProps {
  activeView: DashboardView;
  onNavigate: (view: DashboardView) => void;
}

/**
 * Compact logo icon for collapsed sidebar state.
 */
const LogoIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.8,2.8L21.2,4.2C21.6,4.6,21.6,5.2,21.2,5.6L16.6,10.2L13.8,7.4L18.4,2.8C18.8,2.4,19.4,2.4,19.8,2.8Z"
      className="text-secondary"
      fill="currentColor"
    />
    <path
      d="M13.8,7.4L16.6,10.2L6.4,20.4L2,22L3.6,17.6L13.8,7.4Z"
      className="text-primary"
      fill="currentColor"
    />
    <path
      d="M6.4,20.4L4.8,18.8L2,22L3.6,20.4L6.4,20.4Z"
      className="text-foreground"
      fill="currentColor"
    />
  </svg>
);

/**
 *
 */
export function DashboardSidebar({ activeView, onNavigate }: DashboardSidebarProps) {
  const t = useTranslations("Pages.Dashboard");
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { hasPermission } = usePermissions();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const allNavItems: NavItem[] = [
    {
      id: "overview",
      permission: PERMISSION_CODES.ADMIN_DASHBOARD_READ,
      label: t("Overview"),
      icon: "dashboard",
    },
    {
      id: "products",
      permission: PERMISSION_CODES.ADMIN_PRODUCTS_READ,
      label: t("Products"),
      icon: "package_2",
    },
    {
      id: "inventory",
      permission: PERMISSION_CODES.ADMIN_INVENTORY_READ,
      label: t("Inventory"),
      icon: "inventory_2",
    },
    {
      id: "orders",
      permission: PERMISSION_CODES.ADMIN_ORDERS_READ,
      label: t("Orders"),
      icon: "shopping_cart",
    },
    {
      id: "customers",
      permission: PERMISSION_CODES.ADMIN_USERS_READ,
      label: t("Customers"),
      icon: "group",
    },
    {
      id: "school_lists",
      permission: PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ,
      label: t("SchoolLists"),
      icon: "menu_book",
    },
    {
      id: "media",
      permission: PERMISSION_CODES.ADMIN_MEDIA_READ,
      label: t("Media"),
      icon: "image",
    },
    {
      id: "team",
      permission: PERMISSION_CODES.ADMIN_USERS_READ,
      label: t("Team"),
      icon: "shield_person",
    },
    {
      id: "settings",
      permission: PERMISSION_CODES.ADMIN_ROLES_READ,
      label: t("Settings"),
      icon: "manage_accounts",
    },
  ];

  const navItems = allNavItems.filter((item) => hasPermission(item.permission));

  /**
   * Navigate and close mobile drawer.
   */
  const handleNav = (view: DashboardView) => {
    onNavigate(view);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar side={isRtl ? "right" : "left"} collapsible="icon" dir={isRtl ? "rtl" : "ltr"}>
      {/* Logo */}
      <SidebarHeader className="h-16 items-center justify-center border-b border-sidebar-border">
        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          aria-label="Go to homepage"
        >
          {isCollapsed ? <LogoIcon /> : <Logo />}
        </button>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    tooltip={item.label}
                    onClick={() => handleNav(item.id)}
                    size="default"
                  >
                    <Icon name={item.icon} className="text-lg" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: Theme + Language toggles */}
      <SidebarFooter>
        <SidebarSeparator />
        <div className="flex items-center justify-center gap-1 py-1">
          <ToggleTheme />
          {!isCollapsed && <ToggleLanguage />}
        </div>
      </SidebarFooter>

      {/* Drag rail for desktop resize */}
      <SidebarRail />
    </Sidebar>
  );
}

export type { DashboardView };
