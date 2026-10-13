import * as React from 'react';
import { NavItem } from './NavItem';
import type { NavGroup as NavGroupType, NavItem as NavItemData } from '@/interfaces';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

export interface NavGroupProps {
  group: NavGroupType;
  collapsed?: boolean;
  locale?: string;
}

function hasAnyVisibleItem(
  item: NavItemData,
  can: (p: string) => boolean,
  systemAdmin: boolean,
  portalRole?: string,
): boolean {
  if (systemAdmin) return true;
  const itemAllowed =
    (!item.permission || can(item.permission)) &&
    (!item.anyPermissions || item.anyPermissions.some((p) => can(p))) &&
    (!item.portalRoles ||
      (portalRole ? item.portalRoles.includes(portalRole as 'customer' | 'staff') : false));

  if (itemAllowed) return true;
  if (
    item.children &&
    item.children.some((child) => hasAnyVisibleItem(child, can, systemAdmin, portalRole))
  ) {
    return true;
  }
  return false;
}

export function NavGroup({ group, collapsed = false, locale = 'en' }: NavGroupProps) {
  const { can, systemAdmin, portalRole } = useAdminPermissions();
  const label = locale === 'ar' ? group.labelAr : group.label;

  const visible = group.items.some((item) => hasAnyVisibleItem(item, can, systemAdmin, portalRole));
  if (!visible) {
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
