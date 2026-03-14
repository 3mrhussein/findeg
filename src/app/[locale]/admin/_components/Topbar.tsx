"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { isAdminSession, type SessionPayload } from "@/features/core/domain/auth";
import { NotificationBell } from "@/components/shared/NotificationBell";

/**
 * Admin Topbar component
 */
export function Topbar() {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const t = useTranslations("Pages.Dashboard");

  useEffect(() => {
    /**
     * Fetch the current session
     */
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/v1/auth/me");
        if (response.ok) {
          const data = await response.json();
          setSession(data.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    };

    fetchSession();
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-end border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="h-4 w-px bg-border mx-1" />
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium">
            {session?.user?.email || t("Topbar.RoleAdmin")}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {session && isAdminSession(session)
              ? t("Topbar.RoleAdmin")
              : session?.portalRole || t("Topbar.RoleAdmin")}
          </span>
        </div>
        <Avatar>
          <AvatarImage src="" alt={t("Topbar.RoleAdmin")} />
          <AvatarFallback className="bg-primary text-primary-foreground">A</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
