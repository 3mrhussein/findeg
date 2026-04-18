"use client";

import React from "react";
import { Progress } from "@ui";
import { useTranslations } from "next-intl";

interface ListProgressBarProps {
  total: number;
  reviewed: number;
}

/**
 *
 */
export function ListProgressBar({ total, reviewed }: ListProgressBarProps) {
  const t = useTranslations("School.ParentExperience.List");
  const percent = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2 min-w-[200px] items-end">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t("Progress", { percent })}
        </span>
        <span className="text-[10px] font-bold text-slate-400">
          {t("ItemsReviewed", { current: reviewed, total })}
        </span>
      </div>
      <Progress value={percent} className="h-2 w-full bg-slate-100" />
    </div>
  );
}
