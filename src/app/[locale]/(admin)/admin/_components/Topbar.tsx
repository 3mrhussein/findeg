"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

interface UserSession {
  email: string;
  role: string;
}

/**
 *
 */
export function Topbar() {
  const [session, setSession] = useState<UserSession | null>(null);
  const t = useTranslations("Pages.Dashboard");

  useEffect(() => {
    /**
     *
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
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium">{session?.email || t("Topbar.RoleAdmin")}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {session?.role === "admin"
              ? t("Topbar.RoleAdmin")
              : session?.role || t("Topbar.RoleAdmin")}
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
