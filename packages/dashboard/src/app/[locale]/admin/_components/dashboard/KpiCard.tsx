/**
 * KpiCard Component
 *
 * Metric card with value, trend indicator, and navigation.
 * Used on dashboard for key performance indicators.
 *
 * Location: src/app/[locale]/admin/_components/dashboard/ (admin-wide)
 */

"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Award,
  CheckCircle2,
  Tag,
  Hash,
  Package,
  Box,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@findeg/ui";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  package: Package,
  tag: Tag,
  box: Box,
  hash: Hash,
  layers: Layers,
  award: Award,
  "check-circle": CheckCircle2,
};

export interface KpiChange {
  value?: number;
  label?: string;
  direction?: "up" | "down" | "neutral";
}

export interface KpiCardProps {
  title: string;
  value: string | number;
  change?: KpiChange;
  iconName: keyof typeof ICON_MAP;
  iconColor?: string;
  iconBg?: string;
  href?: string;
  alert?: boolean;
  className?: string;
}

export function KpiCard({
  title,
  value,
  change,
  iconName,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  href,
  alert = false,
  className,
}: KpiCardProps) {
  const Icon = ICON_MAP[iconName] || Package;
  const isPositive = change?.direction === "up";
  const isNegative = change?.direction === "down";
  const isNeutral = change?.direction === "neutral";

  const content = (
    <Card
      className={cn(
        "transition-all hover:shadow-md h-full flex flex-col justify-between",
        alert
          ? "border-l-4 border-l-amber-500 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30"
          : "hover:border-primary/50",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              iconBg,
              iconColor,
            )}
          >
            {alert ? <AlertCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold">{value}</div>
          {change && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span
                className={cn(
                  "flex items-center font-medium mr-1.5",
                  isPositive && "text-emerald-600 dark:text-emerald-400",
                  isNegative && "text-rose-600 dark:text-rose-400",
                  isNeutral && "text-slate-600 dark:text-slate-400",
                )}
              >
                {isPositive && <TrendingUp className="mr-1 h-3.5 w-3.5" />}
                {isNegative && <TrendingDown className="mr-1 h-3.5 w-3.5" />}
                {isNeutral && <Minus className="mr-1 h-3.5 w-3.5" />}
                {change.value !== undefined ? `${isPositive ? "+" : ""}${change.value}%` : ""}
              </span>
              {change.label && <span>{change.label}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
