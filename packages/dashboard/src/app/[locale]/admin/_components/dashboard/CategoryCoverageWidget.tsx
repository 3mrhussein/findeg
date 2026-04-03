"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CategoryProductDistribution } from "@/features/administration/domain/types";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryCoverageWidgetProps {
  distributions: CategoryProductDistribution[];
}

export function CategoryCoverageWidget({ distributions }: CategoryCoverageWidgetProps) {
  const t = useTranslations("Administration.Dashboard.Widgets.CategoryCoverage");
  const tCommon = useTranslations("Administration.Dashboard");

  return (
    <Card className="h-full border-slate-200 dark:border-slate-800 flex flex-col shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{t("Title")}</CardTitle>
            <CardDescription className="text-sm">{t("Description")}</CardDescription>
          </div>
          <Link
            href="/admin/categories"
            className="text-sm text-primary hover:text-primary/80 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors font-medium flex items-center gap-1"
          >
            {t("ViewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-5 mt-2">
          {distributions.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
              {t("NoData")}
            </div>
          ) : (
            distributions.map((dist) => (
              <div key={dist.categoryId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-4">
                    {dist.categoryName}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {t("ProductsCount", { count: dist.productCount })}
                  </span>
                </div>
                <Progress value={dist.percentage} className="h-2" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
