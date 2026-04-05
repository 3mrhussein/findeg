"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@findeg/ui";
import { Progress } from "@findeg/ui";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { CatalogHealthStats } from "@/features/administration/domain/types";
import { useTranslations } from "next-intl";

interface CatalogCompletionBoardProps {
  stats: CatalogHealthStats;
}

export function CatalogCompletionBoard({ stats }: CatalogCompletionBoardProps) {
  const t = useTranslations("Administration.Dashboard.CatalogHealth");

  const completionPercentage =
    stats.totalProducts > 0 ? Math.round((stats.fullyComplete / stats.totalProducts) * 100) : 0;

  return (
    <Card className="col-span-1 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("Title")}
            </CardTitle>
            <CardDescription className="text-sm mt-1">{t("Description")}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {completionPercentage}%
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t("OverallScore")}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <CompletionRow
            title={t("FullyComplete")}
            count={stats.fullyComplete}
            total={stats.totalProducts}
            href="/admin/products"
            isSuccessRow={true}
            suffix={t("AllSet")}
            allSet={t("AllSet")}
          />
          <CompletionRow
            title={t("MissingCategory")}
            count={stats.missingCategory}
            total={stats.totalProducts}
            href="/admin/products?filter=missing_category"
            isCritical={true}
            suffix={t("NeedsAttention")}
            allSet={t("AllSet")}
          />
          <CompletionRow
            title={t("MissingImages")}
            count={stats.missingImages}
            total={stats.totalProducts}
            href="/admin/products?filter=missing_images"
            isCritical={true}
            suffix={t("NeedsAttention")}
            allSet={t("AllSet")}
          />
          <CompletionRow
            title={t("MissingPrice")}
            count={stats.missingPrice}
            total={stats.totalProducts}
            href="/admin/products?filter=missing_price"
            isCritical={true}
            suffix={t("NeedsAttention")}
            allSet={t("AllSet")}
          />
          <CompletionRow
            title={t("DraftProducts")}
            count={stats.draftProducts}
            total={stats.totalProducts}
            href="/admin/products?filter=draft"
            isCritical={false}
            suffix={t("NeedsAttention")}
            allSet={t("AllSet")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CompletionRow({
  title,
  count,
  total,
  href,
  isCritical,
  isSuccessRow,
  suffix,
  allSet,
}: {
  title: string;
  count: number;
  total: number;
  href: string;
  isCritical?: boolean;
  isSuccessRow?: boolean;
  suffix: string;
  allSet: string;
}) {
  // If success row, percentage is (complete / total)
  // If problem row, percentage is (problem / total) - "problem size"
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  // For success row, complete means count === total
  // For problem row, complete means count === 0
  const isHealthy = isSuccessRow ? count === total : count === 0;

  return (
    <Link
      href={href}
      className="group block hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors p-4 sm:p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="shrink-0 flex items-center justify-center">
            {isHealthy ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : isSuccessRow ? (
              // Success row but not 100% complete
              <AlertCircle className="h-5 w-5 text-amber-500" />
            ) : isCritical ? (
              <AlertCircle className="h-5 w-5 text-rose-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <div className="flex-1 space-y-1.5 w-full">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                {title}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {isSuccessRow ? `${count} / ${total}` : count > 0 ? `${count} ${suffix}` : allSet}
              </span>
            </div>
            <Progress
              value={percentage}
              className="h-2 w-full"
              indicatorClassName={
                isHealthy
                  ? "bg-emerald-500"
                  : isSuccessRow
                    ? "bg-emerald-500"
                    : isCritical
                      ? "bg-rose-500"
                      : "bg-amber-500"
              }
            />
          </div>
        </div>
        <div className="flex items-center justify-end sm:w-8 shrink-0">
          <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-slate-200 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
