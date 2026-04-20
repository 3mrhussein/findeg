"use client";

import { useTranslations } from "next-intl";
import { X, Trash2, CheckCircle, Ban } from "lucide-react";
import { Button } from "@findeg/ui";
import { Separator } from "@findeg/ui";
import { cn } from "@lib/utils";

interface BulkActionsBarProps {
  selectedIds: number[];
  onClear: () => void;
  onActivate: (ids: number[]) => void;
  onDeactivate: (ids: number[]) => void;
  onDelete: (ids: number[]) => void;
}

export function BulkActionsBar({
  selectedIds,
  onClear,
  onActivate,
  onDeactivate,
  onDelete,
}: BulkActionsBarProps) {
  const t = useTranslations("Administration.Catalog.Products");
  const count = selectedIds.length;

  if (count === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 rounded-full shadow-2xl border border-slate-800 dark:border-slate-700 ring-1 ring-white/10 dark:ring-black/20">
        <div className="flex items-center gap-3 pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-6 w-6 hover:bg-white/20 dark:hover:bg-slate-700 text-white dark:text-slate-200"
          >
            <X className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium whitespace-nowrap">
            {t("Bulk.Selected", { count })}
          </span>
        </div>

        <Separator orientation="vertical" className="h-6 bg-white/20 dark:bg-slate-700" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onActivate(selectedIds)}
            className="h-8 hover:bg-white/20 dark:hover:bg-slate-700 text-white dark:text-slate-200"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("Bulk.Activate")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeactivate(selectedIds)}
            className="h-8 hover:bg-white/20 dark:hover:bg-slate-700 text-white dark:text-slate-200"
          >
            <Ban className="mr-2 h-4 w-4" />
            {t("Bulk.Deactivate")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(selectedIds)}
            className="h-8 hover:bg-destructive/80 hover:text-destructive-foreground text-destructive-foreground/90 font-medium"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("Bulk.Delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}
