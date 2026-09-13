'use client';

import { Search, Menu } from 'lucide-react';
import { Button } from '@findeg/ui';
import { ToggleTheme } from '@findeg/ui';
import ToggleLanguage from '@components/shared/ToggleLanguage';
import { WebMCPBadge } from '@components/shared/WebMCPBadge';
// Removed unused useRouter
import { useSidebar } from './SidebarContext';
import { Suspense, useState, useRef, useEffect, ReactNode } from 'react';

export interface AdminHeaderProps {
  locale?: string;
  userSlot?: ReactNode;
  notificationSlot?: ReactNode;
}

/**
 * AdminHeader - Static shell for the admin header.
 * Decouples dynamic session data (user, notifications) into slots to support PPR.
 */
export function AdminHeader({ locale = 'en', userSlot, notificationSlot }: AdminHeaderProps) {
  const { toggleSidebar } = useSidebar();

  // Search Palette State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPaletteRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when palette opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside listener for Search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isSearchOpen &&
        searchPaletteRef.current &&
        !searchPaletteRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  // OS detection for keyboard shortcuts to avoid hydration mismatch
  const [platformLabel, setPlatformLabel] = useState('Ctrl+K');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const nav = navigator as Navigator & { userAgentData?: { platform: string } };
      const isMac =
        nav?.platform?.toLowerCase().includes('mac') ||
        (nav as any)?.userAgentData?.platform?.toLowerCase().includes('mac');
      setPlatformLabel(isMac ? '⌘K' : 'Ctrl+K');
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-[60px] w-full items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-col justify-center">
          <span className="text-[13px] text-gray-400 font-medium tracking-wide uppercase">
            Dashboard
          </span>
        </div>
      </div>

      {/* Center Section — Search */}
      <div className="relative w-full max-w-[480px] hidden md:block" ref={searchPaletteRef}>
        <div className="relative cursor-text" onClick={() => setIsSearchOpen(true)}>
          <Search className="absolute inset-s-[10px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-gray-400 pointer-events-none rtl:scale-x-[-1]" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="h-[36px] w-full rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 ps-[36px] pe-[48px] text-[14px] outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-indigo-400 transition-all pointer-events-none"
            readOnly
          />
          <kbd className="absolute inset-e-[10px] top-1/2 -translate-y-1/2 rounded border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 px-1 py-px text-[10px] text-gray-500 dark:text-gray-400">
            {platformLabel}
          </kbd>
        </div>

        {/* Command Palette Dropdown Panel */}
        {isSearchOpen && (
          <div className="absolute left-0 top-full mt-1 w-full rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden flex flex-col">
            <div className="relative border-b border-gray-100 dark:border-slate-800 p-2">
              <Search className="absolute inset-s-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-gray-400 rtl:scale-x-[-1]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent ps-8 pe-4 text-[14px] text-gray-800 dark:text-gray-200 outline-none placeholder:text-gray-400 h-[36px]"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto py-2">
              {searchQuery.length > 0 ? (
                <>
                  <div className="px-3 pb-1 pt-2">
                    <span className="text-[11px] font-medium uppercase text-gray-400">
                      Products
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex h-[44px] cursor-pointer items-center px-[12px] hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                      <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white font-bold">
                        FC
                      </div>
                      <span className="ms-3 text-[14px] text-gray-800 dark:text-gray-200">
                        Faber-Castell Grip Pencil
                      </span>
                      <span className="ms-auto text-[12px] text-gray-500">FC-GRIP</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[60px]">
                  <span className="text-[14px] text-gray-400">Type to search...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Suspense fallback={<div className="w-[88px] h-[32px]" />}>
          <ToggleLanguage />
        </Suspense>
        <ToggleTheme />
        <WebMCPBadge />
        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Dynamic Notification Slot */}
        {notificationSlot}

        {/* Dynamic User Menu Slot */}
        {userSlot}
      </div>
    </header>
  );
}
