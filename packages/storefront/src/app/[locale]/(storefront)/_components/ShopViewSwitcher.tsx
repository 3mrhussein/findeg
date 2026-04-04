"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@findeg/ui";
import { IconTooltip } from "@findeg/ui";
import { LayoutGrid, List } from "lucide-react";

/**
 *
 */
export function ShopViewSwitcher() {
  const t = useTranslations("Pages.Shop");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentView = searchParams.get("view") === "list" ? "list" : "grid";

  /**
   *
   */
  const setView = (view: "grid" | "list") => {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
      <IconTooltip label={t("GridView")} asChild>
        <Button
          variant={currentView === "grid" ? "default" : "ghost"}
          size="icon"
          className={`w-8 h-8 rounded-full ${currentView === "grid" ? "shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
          onClick={() => setView("grid")}
          aria-label={t("GridView")}
          title={t("GridView")}
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
      </IconTooltip>
      <IconTooltip label={t("ListView")} asChild>
        <Button
          variant={currentView === "list" ? "default" : "ghost"}
          size="icon"
          className={`w-8 h-8 rounded-full ${currentView === "list" ? "shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
          onClick={() => setView("list")}
          aria-label={t("ListView")}
          title={t("ListView")}
        >
          <List className="w-4 h-4" />
        </Button>
      </IconTooltip>
    </div>
  );
}
