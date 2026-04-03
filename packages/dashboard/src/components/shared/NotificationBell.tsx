"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, ExternalLink, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Notification } from "@/features/core/infrastructure/persistence/schema/notifications";

/**
 * Notification Bell component with unread count polling and popover.
 */
export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Notifications");
  const locale = useLocale();

  /**
   * Fetch latest unread count
   */
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error("[NotificationBell] Failed to fetch count:", error);
    }
  }, []);

  /**
   * Fetch latest notifications
   */
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error("[NotificationBell] Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mark all as read
   */
  const markAllRead = async () => {
    try {
      const res = await fetch("/api/v1/notifications/mark-read", { method: "POST" });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("[NotificationBell] Failed to mark read:", error);
    }
  };

  // Poll for count every 60s
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  /**
   * Format the type to a localized label
   */
  const getTypeLabel = (type: string) => {
    // Convert dot-notation or snake_case to PascalCase for mapping
    const key = type
      .split(/[._]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("") as any;

    // Check if key exists in Types, fallback to raw type
    try {
      return t(`Types.${key}` as any);
    } catch {
      return type;
    }
  };

  return (
    <Popover onOpenChange={(open: boolean) => open && fetchNotifications()}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={t("Title")}
        >
          <Bell className="size-5 text-slate-700 dark:text-slate-200" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center rounded-full p-1 text-[10px] font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">{t("Title")}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:bg-transparent"
              onClick={markAllRead}
            >
              <Check className="mr-1 size-3" />
              {t("MarkAllRead")}
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center p-4 text-center">
              <p className="text-sm text-muted-foreground">{t("Empty")}</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.actionUrl || "#"}
                  className={cn(
                    "flex flex-col gap-1 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50",
                    !n.isRead && "bg-blue-50/50 dark:bg-blue-900/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-primary">{getTypeLabel(n.type)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium leading-tight">
                    {locale === "ar" ? n.titleAr : n.titleEn}
                  </h4>
                  {(locale === "ar" ? n.bodyAr : n.bodyEn) && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {locale === "ar" ? n.bodyAr : n.bodyEn}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button asChild variant="ghost" className="w-full text-xs" size="sm">
            <Link href="/dashboard/notifications">
              {t("ViewAll")}
              <ExternalLink className="ml-2 size-3" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
