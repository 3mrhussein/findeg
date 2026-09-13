'use client';

import * as React from 'react';
import { Link } from '@i18n/navigation';
import * as LucideIcons from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@findeg/ui';
import { cn } from '@lib/utils';
import { usePathname } from '@/i18n/navigation';
import type { NavItem } from '@/interfaces';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

export interface NavItemProps {
  item: NavItem;
  collapsed?: boolean;
  locale?: string;
  depth?: number;
}

export function NavItem({ item, collapsed = false, locale = 'en', depth = 0 }: NavItemProps) {
  const pathname = usePathname();
  const { can, portalRole, systemAdmin } = useAdminPermissions();
  // Normalize pathname and href for comparison (remove locale prefix)
  const normalizedPathname = pathname.replace(new RegExp(`^/${locale}`), '');

  const [isOpen, setIsOpen] = React.useState(() => {
    if (item.persistent) return true;
    return item.children?.some((child) => normalizedPathname.startsWith(child.href)) ?? false;
  });

  // An item is active if the current path matches its href exactly,
  // or if it's the root of the current path (dashboard)
  const isActive =
    item.href === '/'
      ? normalizedPathname === '/'
      : normalizedPathname === item.href || normalizedPathname.startsWith(`${item.href}/`);

  const label = locale === 'ar' ? item.labelAr : item.label;

  // Permission check
  if (item.permission && !systemAdmin && !can(item.permission)) {
    return null;
  }

  // Portal role check
  if (item.portalRoles && !systemAdmin) {
    if (!portalRole || !item.portalRoles.includes(portalRole)) {
      return null;
    }
  }

  const IconComponent = LucideIcons[item.icon as keyof typeof LucideIcons] as
    | LucideIcons.LucideIcon
    | undefined;
  const hasChildren = item.children && item.children.length > 0;

  // Render the row
  const rowContent = (
    <div
      onClick={() => {
        if (hasChildren && !item.persistent) setIsOpen(!isOpen);
      }}
      className={cn(
        'flex items-center rounded-md transition-all duration-200',
        'cursor-pointer',
        depth === 0 ? 'h-[40px] px-[12px] py-[8px]' : 'h-[36px] py-[8px] pe-[12px]',
        // Dynamic horizontal padding based on depth for children
        depth > 0 && `ps-[${12 + depth * 20}px]`,
        isActive
          ? 'border-s-[3px] border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-semibold'
          : 'hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 border-s-[3px] border-transparent font-medium',
        !isActive && 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200',
        collapsed && 'justify-center px-0',
      )}
      style={depth > 0 ? { paddingInlineStart: `${12 + depth * 20}px` } : {}}
    >
      {IconComponent && (
        <IconComponent
          className={cn(
            'h-[16px] w-[16px] shrink-0',
            isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600',
          )}
          aria-hidden="true"
        />
      )}
      {!collapsed && (
        <>
          <span
            className={cn('ms-[10px] truncate flex-1', depth > 0 ? 'text-[12px]' : 'text-[14px]')}
          >
            {label}
          </span>
          {hasChildren && !item.persistent && (
            <ChevronRight
              className={cn(
                'h-[12px] w-[12px] shrink-0 transition-transform duration-200 rtl:rotate-180',
                isActive ? 'text-indigo-600' : 'text-gray-400',
                isOpen && 'rotate-90 rtl:rotate-90',
              )}
            />
          )}
        </>
      )}
    </div>
  );

  const clickableRow = (
    <Link href={item.href} className="block group">
      {rowContent}
    </Link>
  );

  const itemWithTooltip = collapsed ? (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>{clickableRow}</TooltipTrigger>
        <TooltipContent side="right" className="z-50 filter drop-shadow-md">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    clickableRow
  );

  return (
    <div className="flex flex-col">
      {itemWithTooltip}

      {/* Children rendering */}
      {!collapsed && hasChildren && isOpen && (
        <div className="flex flex-col mt-1">
          {item.children!.map((child) => (
            <NavItem
              key={child.href}
              item={child}
              collapsed={collapsed}
              locale={locale}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
