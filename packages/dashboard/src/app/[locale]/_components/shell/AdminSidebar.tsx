"use client";

import * as React from "react";
import { Link } from "@i18n/navigation";
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@ui";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@ui";
import { ScrollArea } from "@ui";
import { cn } from "@lib/utils";
import { NavGroup } from "./NavGroup";
import { ADMIN_NAV } from "@dashboard/features/administration/presentation/config/nav-config";
import { getAvatarColorClass, getInitials } from "@lib/avatar-color";
import { useSidebar } from "./SidebarContext";

export interface AdminSidebarProps {
  userEmail?: string;
  userName?: string;
  userRole?: string;
  locale?: string;
  onLogout?: () => void;
}

export function AdminSidebar({
  userEmail,
  userName,
  userRole,
  locale = "en",
  onLogout,
}: AdminSidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  const initials = getInitials(userName, userEmail);
  const avatarBgClass = getAvatarColorClass(userName || userEmail || "A");

  const displayName = userName || userEmail || "Admin";
  const displayEmail = userEmail || "";
  const displayRole = userRole || "Staff";

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-white dark:bg-slate-900 border-e border-gray-200 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-[64px]" : "w-[240px]",
      )}
    >
      {/* Top Logo Area (60px) */}
      <div
        className={cn(
          "flex items-center h-[60px] border-b border-gray-200 dark:border-slate-800 px-4 shrink-0",
          isCollapsed ? "justify-center" : "justify-between",
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
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 text-gray-500" />
          ) : (
            <PanelLeftClose className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation Groups */}
      <ScrollArea className="flex-1 overflow-y-auto w-full py-4">
        {ADMIN_NAV.map((group, index) => (
          <NavGroup key={index} group={group} collapsed={isCollapsed} locale={locale} />
        ))}
      </ScrollArea>

      {/* User Profile Area */}
      <div className="mt-auto border-t border-gray-200 dark:border-slate-800 p-[12px] flex flex-col shrink-0">
        {!isCollapsed ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-[32px] w-[32px]">
                <AvatarFallback
                  className={cn("text-[11px] font-semibold text-white", avatarBgClass)}
                >
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
              onClick={onLogout}
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
                    <AvatarFallback
                      className={cn("text-[11px] font-semibold text-white", avatarBgClass)}
                    >
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
    </aside>
  );
}
