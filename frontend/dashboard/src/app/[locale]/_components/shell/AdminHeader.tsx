"use client";

import * as React from "react";
import { Search, Bell, Menu, Package, ShoppingCart } from "lucide-react";
import { Input } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Avatar, AvatarFallback } from "@findeg/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@findeg/ui";
import { ToggleTheme } from "@findeg/ui";
import ToggleLanguage from "@components/shared/ToggleLanguage";
import { WebMCPBadge } from "@components/shared/WebMCPBadge";
import { cn } from "@lib/utils";
import { useRouter } from "@i18n/navigation";
import { useSidebar } from "./SidebarContext";
import { getAvatarColorClass, getInitials } from "@lib/avatar-color";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface AdminHeaderProps {
  userEmail?: string;
  userName?: string;
  notificationCount?: number;
  locale?: string;
  onLogout?: () => void;
}

export function AdminHeader({
  userEmail,
  userName,
  notificationCount = 0,
  locale = "en",
  onLogout,
}: AdminHeaderProps) {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  // Search Palette State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchPaletteRef = React.useRef<HTMLDivElement>(null);

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const notificationsRef = React.useRef<HTMLDivElement>(null);

  const { data: notifData, mutate: mutateNotifs } = useSWR(
    "/api/v1/notifications/unread-count",
    fetcher,
    { refreshInterval: 30000 },
  );

  const unreadCount = notifData?.count !== undefined ? notifData.count : notificationCount;

  // Keyboard shortcut Cmd/Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input when palette opens
  React.useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside listener for Search and Notifications
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Search outside click
      if (
        isSearchOpen &&
        searchPaletteRef.current &&
        !searchPaletteRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      // Notifications outside click
      if (
        isNotificationsOpen &&
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen, isNotificationsOpen]);

  // OS detection for keyboard shortcuts to avoid hydration mismatch
  const [platformLabel, setPlatformLabel] = React.useState("Ctrl+K");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const nav = navigator as Navigator & { userAgentData?: { platform: string } };
      const isMac =
        nav.platform.toLowerCase().includes("mac") ||
        nav.userAgentData?.platform?.toLowerCase().includes("mac");
      setPlatformLabel(isMac ? "⌘K" : "Ctrl+K");
    }
  }, []);

  const initials = getInitials(userName, userEmail);
  const avatarBgClass = getAvatarColorClass(userName || userEmail || "A");

  const displayName = userName || userEmail || "Admin";
  const displayEmail = userEmail || "";

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/v1/notifications/mark-read", { method: "POST" });
      mutateNotifs({ count: 0 }, false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-[60px] w-full items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
      {/* Spacer to push content to the right of fixed sidebar? 
          No, the specification says "Width: full width of the main content area (NOT including sidebar)."
          Ah, if this is inside the flex-1 flex-col, its width WILL automatically be 100% of the remaining area!
          Wait, the spec mentions "Fixed bar". I will use `sticky top-0` instead of `fixed w-full` to avoid
          having to calculate width manually since it's nested inside the `main` layout column. 
      */}

      {/* Left Section */}
      <div className="flex flex-col ms-2 justify-center">
        <span className="text-[13px] text-gray-400 font-medium tracking-wide uppercase">
          Dashboard
        </span>
      </div>

      {/* Center Section — Search */}
      <div className="relative w-[480px]" ref={searchPaletteRef}>
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
              {/* Dummy Results for UI Demonstration */}
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
                    <div className="flex h-[44px] cursor-pointer items-center px-[12px] hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                      <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-sky-500 text-[10px] text-white font-bold">
                        B
                      </div>
                      <span className="ms-3 text-[14px] text-gray-800">BIC Ballpoint Blue</span>
                      <span className="ms-auto text-[12px] text-gray-500">BIC-001</span>
                    </div>
                  </div>

                  <div className="px-3 pb-1 pt-2 mt-2">
                    <span className="text-[11px] font-medium uppercase text-gray-400">Orders</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex h-[44px] cursor-pointer items-center px-[12px] hover:bg-indigo-50">
                      <ShoppingCart className="h-[16px] w-[16px] text-gray-400" />
                      <span className="ms-3 text-[14px] text-gray-800">#1042</span>
                      <span className="ms-3 text-[12px] text-gray-500">Ahmed Hassan</span>
                      <span className="ms-auto text-[12px] text-gray-500">EGP 76</span>
                    </div>
                    <div className="flex h-[44px] cursor-pointer items-center px-[12px] hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                      <ShoppingCart className="h-[16px] w-[16px] text-gray-400" />
                      <span className="ms-3 text-[14px] text-gray-800 dark:text-gray-200">
                        #1041
                      </span>
                      <span className="ms-3 text-[12px] text-gray-500">Sara Mohamed</span>
                      <span className="ms-auto text-[12px] text-gray-500">EGP 45</span>
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
      <div className="flex items-center gap-2">
        <ToggleLanguage />
        <ToggleTheme />
        <WebMCPBadge />
        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-1" />
        {/* Notification Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex h-[36px] w-[36px] items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="h-[20px] w-[20px] text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -inset-e-1 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute inset-e-0 top-full mt-1 w-[320px] rounded-lg border border-gray-200 bg-white shadow-xl z-50 overflow-hidden flex flex-col max-h-[420px]">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 z-10">
                <span className="text-[14px] font-semibold text-gray-800">Notifications</span>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[12px] text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Mark all read
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* Dummy Notifications Example. Replace with actual API data */}
                {unreadCount > 0 ? (
                  <>
                    <div className="flex min-h-[56px] cursor-pointer flex-row items-start gap-4 p-4 bg-indigo-50 hover:bg-indigo-100 border-b border-indigo-50 transition-colors">
                      <div className="mt-0.5">
                        <ShoppingCart className="h-[16px] w-[16px] text-indigo-500" />
                      </div>
                      <div className="flex flex-1 flex-col truncate">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-medium text-gray-800 truncate">
                            New Order #1043
                          </span>
                          <span className="text-[11px] text-gray-400 shrink-0">Just now</span>
                        </div>
                        <span className="text-[12px] text-gray-500 line-clamp-2">
                          Ahmed Hassan placed a new order for EGP 120.
                        </span>
                      </div>
                    </div>
                    <div className="flex min-h-[56px] cursor-pointer flex-row items-start gap-4 p-4 bg-white hover:bg-gray-50 border-b border-gray-100 transition-colors">
                      <div className="mt-0.5">
                        <Package className="h-[16px] w-[16px] text-amber-500" />
                      </div>
                      <div className="flex flex-1 flex-col truncate">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-medium text-gray-800 truncate">
                            Low Stock Alert
                          </span>
                          <span className="text-[11px] text-gray-400 shrink-0">2 hrs ago</span>
                        </div>
                        <span className="text-[12px] text-gray-500 line-clamp-2">
                          Faber-Castell Grip Pencil is running low (on 2 units remaining).
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 py-8">
                    <Bell className="h-[32px] w-[32px] text-gray-300 mb-2" />
                    <span className="text-[14px] text-gray-400">No notifications yet</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-[32px] w-[32px] items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
              <Avatar className="h-full w-full">
                <AvatarFallback
                  className={cn("text-[11px] font-semibold text-white", avatarBgClass)}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[200px] mt-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-lg"
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
                onClick={() => router.push("/account")}
              >
                <span className="mr-2">👤</span> View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer focus:bg-gray-50 dark:focus:bg-slate-800"
                onClick={() => window.open("/", "_blank")}
              >
                <span className="mr-2">↗</span> Switch to Storefront
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-gray-100 dark:bg-slate-800" />
            <div className="py-1">
              <DropdownMenuItem
                onClick={onLogout}
                className="text-[13px] text-red-600 font-medium cursor-pointer focus:bg-red-50 focus:text-red-700"
              >
                <span className="mr-2 text-current">→</span> Logout
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
