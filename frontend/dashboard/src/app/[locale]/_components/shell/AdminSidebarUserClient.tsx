'use client';

import * as React from 'react';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@findeg/ui';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@findeg/ui';
import { cn } from '@lib/utils';
import { getAvatarColorClass, getInitials } from '@lib/avatar-color';
import { useSidebar } from './SidebarContext';
import { logoutAction as logout } from '@actions/auth-actions';

interface AdminSidebarUserClientProps {
  userEmail?: string;
  userName?: string;
  userRole?: string;
  locale?: string;
}

/**
 * AdminSidebarUserClient - Client-side part of the sidebar user profile.
 * Responsive to sidebar collapse state via context.
 */
export function AdminSidebarUserClient({
  userEmail,
  userName,
  userRole,
  locale = 'en',
}: AdminSidebarUserClientProps) {
  const { isCollapsed } = useSidebar();

  const handleLogout = async () => {
    await logout();
  };

  const initials = getInitials(userName, userEmail);
  const avatarBgClass = getAvatarColorClass(userName || userEmail || 'A');

  const displayName = userName || userEmail || 'Admin';
  const displayEmail = userEmail || '';
  const displayRole = userRole || 'Staff';

  return (
    <div className="mt-auto border-t border-gray-200 dark:border-slate-800 p-[12px] flex flex-col shrink-0">
      {!isCollapsed ? (
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-[32px] w-[32px]">
              <AvatarFallback className={cn('text-[11px] font-semibold text-white', avatarBgClass)}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
                {displayName}
              </span>
              <span className="text-[11px] text-gray-500 truncate">{displayEmail}</span>
              <span className="text-[10px] text-gray-400 capitalize">{displayRole}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full h-[32px] flex items-center justify-center gap-2 rounded-md text-[12px] text-gray-500 bg-transparent hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
          >
            <LogOut className="h-[14px] w-[14px]" />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center w-full">
                <Avatar className="h-[32px] w-[32px] cursor-pointer">
                  <AvatarFallback className={cn('text-[11px] font-semibold text-white', avatarBgClass)}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>
                {displayName} · {displayEmail}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
