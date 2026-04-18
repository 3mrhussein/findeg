"use client";

import * as React from "react";
import { NavItem } from "./NavItem";
import { useAdminPermissions } from "@dashboard/features/administration/presentation/hooks/useAdminPermissions";
import type { NavGroup as NavGroupType } from "@dashboard/features/administration/presentation/config/nav-config";

export interface NavGroupProps {
  group: NavGroupType;
  collapsed?: boolean;
  locale?: string;
}

export function NavGroup({ group, collapsed = false, locale = "en" }: NavGroupProps) {
  const label = locale === "ar" ? group.labelAr : group.label;

  // We check if the group ends up having any visible items.
  // We can just rely on NavItem to filter itself out, but if NavGroup is effectively empty,
  // we might still render the header. For simplicity in this layout, we just render it.

  if (group.items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col mb-2">
      {label && !collapsed && (
        <div className="pt-[16px] pb-[8px] flex flex-col">
          <h3 className="px-[12px] text-[10px] uppercase font-medium tracking-[0.08em] text-gray-400">
            {label}
          </h3>
          <div className="h-px w-full bg-gray-100 dark:bg-slate-800 mt-2" />
        </div>
      )}

      <nav className="flex flex-col gap-1 px-[12px] mt-1">
        {group.items.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed} locale={locale} />
        ))}
      </nav>
    </div>
  );
}
