'use client';

import * as React from 'react';
import { cn } from '@lib/utils';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export interface AdminSidebarProps {
  locale?: string;
  userSlot?: React.ReactNode;
  navSlot?: React.ReactNode;
}

export function AdminSidebar({
  locale = 'en',
  userSlot,
  navSlot,
}: AdminSidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-white dark:bg-slate-900 border-e border-gray-200 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0',
        isCollapsed ? 'w-[64px]' : 'w-[240px]',
      )}
    >
      {/* Top Logo Area (60px) */}
      <div
        className={cn(
          'flex items-center h-[60px] border-b border-gray-200 dark:border-slate-800 px-4 shrink-0',
          isCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center overflow-hidden">
            <span className="text-indigo-600 font-bold text-lg truncate flex-1">FindEg</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 text-gray-500" />
          ) : (
            <PanelLeftClose className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation Slot (Dynamic content) */}
      {navSlot}

      {/* User Profile Area Slot */}
      {userSlot}
    </aside>
  );
}
