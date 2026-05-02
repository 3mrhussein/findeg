"use client";

import { useState, useEffect } from "react";
import { Bell, Check, ExternalLink, Loader2, Filter, MoreVertical, Trash } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Badge } from "@findeg/ui";
import { ScrollArea } from "@findeg/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@findeg/ui";
import { Link } from "@i18n/navigation";
import { cn } from "@lib/utils";

/**
 * Notification type (local definition)
 */
type Notification = {
  id: number;
  type: string;
  isRead: boolean;
  createdAt: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  actionUrl?: string;
};

/**
 * Admin Notifications Page
 */
export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const t = useTranslations("Notifications");
  const locale = useLocale();

  /**
   * Fetch notifications
   */
  const fetchNotifications = async (p: number = 1) => {
    try {
      const res = await fetch(`/api/v1/notifications?page=${p}`);
      if (res.ok) {
        const data = await res.json();
        if (p === 1) {
          setNotifications(data.data.notifications);
        } else {
          setNotifications((prev) => [...prev, ...data.data.notifications]);
        }
        setHasMore(data.data.hasMore);
      }
    } catch (error) {
      console.error("[AdminNotifications] Fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchNotifications(1);
    };
    init();
  }, []);

  /**
   * Mark all as read
   */
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/v1/notifications/mark-read", { method: "POST" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("[AdminNotifications] Mark all read failed:", error);
    }
  };

  /**
   * Mark one as read
   */
  const handleMarkRead = async (id: number) => {
    try {
      const res = await fetch("/api/v1/notifications/mark-read", {
        method: "POST",
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      }
    } catch (error) {
      console.error("[AdminNotifications] Mark read failed:", error);
    }
  };

  /**
   * Get localized type label
   */
  const getTypeLabel = (type: string) => {
    const key = type
      .split(/[._]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("") as any;
    try {
      return t(`Types.${key}` as any);
    } catch {
      return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Title")}</h1>
          <p className="text-muted-foreground">Manage your alerts and system events.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <Check className="mr-2 h-4 w-4" />
            {t("MarkAllRead")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Recent History</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-3">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y border-t">
            {isLoading && notifications.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center p-8 text-center">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground/20" />
                <p className="text-muted-foreground">{t("Empty")}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex flex-col gap-1 p-6 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/10 sm:flex-row sm:items-start sm:gap-6",
                    !n.isRead && "bg-blue-50/30 dark:bg-blue-900/5",
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {!n.isRead && <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {getTypeLabel(n.type)}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleDateString(locale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold">
                      {locale === "ar" ? n.titleAr : n.titleEn}
                    </h3>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                      {locale === "ar" ? n.bodyAr : n.bodyEn}
                    </p>
                    {n.actionUrl && (
                      <div className="mt-4 flex items-center gap-3">
                        <Button asChild variant="secondary" size="sm">
                          <Link href={n.actionUrl}>
                            View Details
                            <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                        {!n.isRead && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>
                            Mark as read
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-2 sm:mt-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!n.isRead && (
                          <DropdownMenuItem onClick={() => handleMarkRead(n.id)}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark as read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
          {hasMore && (
            <div className="flex items-center justify-center p-4 border-t">
              <Button
                variant="ghost"
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  setIsLoading(true);
                  fetchNotifications(next);
                }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load more"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
