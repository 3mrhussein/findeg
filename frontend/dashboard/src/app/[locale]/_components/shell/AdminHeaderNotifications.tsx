'use client';

import * as React from 'react';
import { Bell, ShoppingCart, Package } from 'lucide-react';
import useSWR from 'swr';
import { useSession } from '@providers/SessionProvider';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AdminHeaderNotificationsProps {
  locale?: string;
  initialCount?: number;
}

export function AdminHeaderNotifications({
  locale = 'en',
  initialCount = 0,
}: AdminHeaderNotificationsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const session = useSession();

  const { data, mutate } = useSWR(
    session ? '/api/v1/notifications/unread-count' : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const unreadCount = data?.count !== undefined ? data.count : initialCount;

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/v1/notifications/mark-read', { method: 'POST' });
      mutate({ count: 0 }, false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-[36px] w-[36px] items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell className="h-[20px] w-[20px] text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -inset-e-1 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute inset-e-0 top-full mt-1 w-[320px] rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden flex flex-col max-h-[420px]">
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 z-10">
            <span className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">Notifications</span>
            <button
              onClick={handleMarkAllRead}
              className="text-[12px] text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Mark all read
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {unreadCount > 0 ? (
              <>
                <div className="flex min-h-[56px] cursor-pointer flex-row items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border-b border-indigo-50 dark:border-indigo-900/10 transition-colors">
                  <div className="mt-0.5">
                    <ShoppingCart className="h-[16px] w-[16px] text-indigo-500" />
                  </div>
                  <div className="flex flex-1 flex-col truncate">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
                        New Order #1043
                      </span>
                      <span className="text-[11px] text-gray-400 shrink-0">Just now</span>
                    </div>
                    <span className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2">
                      Ahmed Hassan placed a new order for EGP 120.
                    </span>
                  </div>
                </div>
                <div className="flex min-h-[56px] cursor-pointer flex-row items-start gap-4 p-4 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-slate-800 transition-colors">
                  <div className="mt-0.5">
                    <Package className="h-[16px] w-[16px] text-amber-500" />
                  </div>
                  <div className="flex flex-1 flex-col truncate">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
                        Low Stock Alert
                      </span>
                      <span className="text-[11px] text-gray-400 shrink-0">2 hrs ago</span>
                    </div>
                    <span className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2">
                      Faber-Castell Grip Pencil is running low (on 2 units remaining).
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 py-8">
                <Bell className="h-[32px] w-[32px] text-gray-300 dark:text-gray-700 mb-2" />
                <span className="text-[14px] text-gray-400">No notifications yet</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
