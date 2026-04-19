/**
 * DashboardHeader
 *
 * Sticky top bar for the dashboard.
 * Contains: SidebarTrigger (hamburger on mobile, collapse on desktop),
 * page title, and contextual actions.
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { SidebarTrigger } from "@ui";
import { Separator } from "@ui";
import { Button } from "@ui";
import { Icon } from "@ui";
import type { DashboardView } from "./DashboardSidebar";

interface DashboardHeaderProps {
  activeView: DashboardView;
}

/**
 *
 */
export function DashboardHeader({ activeView }: DashboardHeaderProps) {
  const t = useTranslations("Pages.Dashboard");

  /** Maps view IDs to translated page titles */
  const VIEW_LABELS: Record<DashboardView, string> = {
    overview: t("Overview"),
    products: t("Products"),
    inventory: t("Inventory"),
    orders: t("Orders"),
    customers: t("Customers"),
    school_lists: t("SchoolLists"),
    media: t("Media"),
    team: t("Team"),
    settings: t("Settings"),
  };

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-card px-4 sticky top-0 z-10">
      <SidebarTrigger className="-ms-2" />
      <Separator orientation="vertical" className="h-5" />

      {/* Page title */}
      <h1 className="text-base font-semibold truncate">{VIEW_LABELS[activeView]}</h1>

      {/* Contextual actions */}
      <div className="ms-auto flex items-center gap-2">
        {activeView === "products" && (
          <Button size="sm">
            <Icon name="add" className="text-base ltr:mr-1.5 rtl:ml-1.5" />
            <span className="hidden sm:inline">{t("AddProduct")}</span>
          </Button>
        )}
      </div>
    </header>
  );
}
