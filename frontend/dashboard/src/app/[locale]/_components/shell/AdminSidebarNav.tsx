'use client';

import * as React from 'react';
import { ScrollArea } from '@findeg/ui';
import { NavGroup } from './NavGroup';
import { ADMIN_NAV } from '@/constants';
import { useSidebar } from './SidebarContext';

interface AdminSidebarNavProps {
  locale: string;
}

/**
 * AdminSidebarNav - Dynamic component that renders the navigation items.
 * Isolated so it can be wrapped in a real session context and Suspense boundary.
 */
export function AdminSidebarNav({ locale }: AdminSidebarNavProps) {
  const { isCollapsed } = useSidebar();

  return (
    <ScrollArea className="flex-1 overflow-y-auto w-full py-4">
      {ADMIN_NAV.map((group, index) => (
        <NavGroup 
          key={index} 
          group={group} 
          collapsed={isCollapsed} 
          locale={locale} 
        />
      ))}
    </ScrollArea>
  );
}
