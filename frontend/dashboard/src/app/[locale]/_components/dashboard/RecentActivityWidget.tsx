"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@findeg/ui";
import { AuditLogEntry } from "@findeg/backend/features/administration";
import { Activity, Edit, Plus, Trash, History } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { enUS, ar } from "date-fns/locale";

interface RecentActivityWidgetProps {
  logs: AuditLogEntry[];
  locale?: string;
}

export function RecentActivityWidget({ logs, locale = "en" }: RecentActivityWidgetProps) {
  const t = useTranslations("Administration.Dashboard.Widgets.RecentActivity");

  // Create a mapping for generic entity translations
  const tEntitiesNames = {
    product: useTranslations("Administration.Dashboard.Entities")("product"),
    category: useTranslations("Administration.Dashboard.Entities")("category"),
    brand: useTranslations("Administration.Dashboard.Entities")("brand"),
    tag: useTranslations("Administration.Dashboard.Entities")("tag"),
  };

  const dateLocale = locale === "ar" ? ar : enUS;

  const getActionIcon = (action: string) => {
    if (action.includes("CREATE"))
      return <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    if (action.includes("UPDATE"))
      return <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    if (action.includes("DELETE"))
      return <Trash className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
    return <Activity className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
  };

  const getActionBg = (action: string) => {
    if (action.includes("CREATE"))
      return "bg-emerald-50 dark:bg-emerald-900/40 border-emerald-100 dark:border-emerald-900/30";
    if (action.includes("UPDATE"))
      return "bg-blue-50 dark:bg-blue-900/40 border-blue-100 dark:border-blue-900/30";
    if (action.includes("DELETE"))
      return "bg-rose-50 dark:bg-rose-900/40 border-rose-100 dark:border-rose-900/30";
    return "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800";
  };

  const formatEntityLabel = (type: string, action: string) => {
    const isCreate = action.includes("CREATE");
    const isUpdate = action.includes("UPDATE");
    const isDelete = action.includes("DELETE");

    const typeKey = type.toLowerCase();
    const typeName = tEntitiesNames[typeKey as keyof typeof tEntitiesNames] || type;

    if (isCreate) return t("CreatedAction", { type: typeName });
    if (isUpdate) return t("UpdatedAction", { type: typeName });
    if (isDelete) return t("DeletedAction", { type: typeName });
    return action;
  };

  return (
    <Card className="col-span-1 md:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
            <History className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{t("Title")}</CardTitle>
            <CardDescription className="text-sm mt-0.5">{t("Description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("NoActivity")}
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${getActionBg(log.action)}`}
                >
                  {getActionIcon(log.action)}
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-800 dark:text-slate-200">
                    {formatEntityLabel(log.entityType, log.action)}{" "}
                    <span className="text-slate-500 dark:text-slate-400 font-normal">
                      #{log.entityId.slice(0, 8)}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
