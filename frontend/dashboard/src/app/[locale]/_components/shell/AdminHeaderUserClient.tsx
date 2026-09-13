'use client';

import * as React from 'react';
import { Avatar, AvatarFallback } from '@findeg/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@findeg/ui';
import { cn } from '@lib/utils';
import { useRouter } from '@i18n/navigation';
import { getAvatarColorClass, getInitials } from '@findeg/backend/lib';
import { logoutAction as logout } from '@actions/auth-actions';

interface AdminHeaderUserClientProps {
  userEmail?: string;
  userName?: string;
  locale?: string;
}

/**
 * AdminHeaderUserClient - Client-side part of the header user menu.
 */
export function AdminHeaderUserClient({
  userEmail,
  userName,
  locale = 'en',
}: AdminHeaderUserClientProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const initials = getInitials(userName, userEmail);
  const avatarBgClass = getAvatarColorClass(userName || userEmail || 'A');

  const displayName = userName || userEmail || 'Admin';
  const displayEmail = userEmail || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
          <Avatar className="h-full w-full">
            <AvatarFallback className={cn('text-[11px] font-semibold text-white', avatarBgClass)}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-50 mt-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-lg"
      >
        <div className="flex flex-col px-3 py-2 border-b border-gray-100 dark:border-slate-800">
          <p className="text-[13px] font-medium text-gray-800 dark:text-gray-200 leading-none mb-1">
            {displayName}
          </p>
          <p className="text-[11px] text-gray-500 leading-none">{displayEmail}</p>
        </div>
        <div className="py-1">
          <DropdownMenuItem
            className="text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer focus:bg-gray-50 dark:focus:bg-slate-800"
            onClick={() => router.push('/account')}
          >
            <span className="mr-2">👤</span> View Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer focus:bg-gray-50 dark:focus:bg-slate-800"
            onClick={() => window.open('/', '_blank')}
          >
            <span className="mr-2">↗</span> Switch to Storefront
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="bg-gray-100 dark:bg-slate-800" />
        <div className="py-1">
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-[13px] text-red-600 font-medium cursor-pointer focus:bg-red-50 focus:text-red-700"
          >
            <span className="mr-2 text-current">→</span> Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
