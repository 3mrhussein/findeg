"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@findeg/ui";
import { Lock, ChevronDown, Check, Plus, RotateCcw } from "lucide-react";
import { cn } from "@lib/utils";
import { Button } from "@findeg/ui";

interface ListItemRowProps {
  item: any;
  selection?: any;
  onSwap?: () => void;
  onToggle?: (included: boolean) => void;
  isOptional?: boolean;
  isLocked?: boolean;
}

/**
 *
 */
export function ListItemRow({
  item,
  selection,
  onSwap,
  onToggle,
  isOptional,
  isLocked,
}: ListItemRowProps) {
  const t = useTranslations("School.ParentExperience.List");
  const isExcluded = isOptional && selection?.isExcluded;
  const hasSwap = !!selection?.variantId;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
        isExcluded
          ? "opacity-60 bg-slate-50 border-transparent grayscale"
          : "bg-white border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/20",
        hasSwap && !isExcluded && "border-primary/30 ring-1 ring-primary/10",
      )}
    >
      {/* Selection State / Checkbox */}
      <div className="shrink-0">
        {isOptional ? (
          <Button
            size="icon"
            variant={isExcluded ? "outline" : "default"}
            className={cn(
              "w-10 h-10 rounded-xl transition-all",
              !isExcluded && "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200",
            )}
            onClick={() => onToggle?.(!!isExcluded)}
          >
            {isExcluded ? <Plus className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          </Button>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Check className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Image Placeholder */}
      <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center border p-1 border-slate-100 overflow-hidden shrink-0">
        <img
          src={selection?.image || item.defaultImage || "https://placehold.co/100x100"}
          alt={item.name}
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>

      {/* Product Details */}
      <div className="grow space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold text-slate-900 leading-tight">
            {selection?.productName || item.name}
          </h4>
          {isLocked && (
            <Badge
              variant="secondary"
              className="bg-slate-100 text-[10px] text-slate-500 gap-1 font-medium"
            >
              <Lock className="w-3 h-3" /> {t("BrandRequired")}
            </Badge>
          )}
          {hasSwap && !isExcluded && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 text-[10px] gap-1 font-medium"
            >
              {t("Swapped")}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-snug">
          {item.description || "School requested brand: Faber-Castell"}
        </p>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-3">
        {!isLocked && !isExcluded && (
          <div className="flex flex-col items-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-primary hover:bg-primary/5 font-bold gap-2 text-xs"
              onClick={onSwap}
            >
              {t("ChangeBrand")}
              <ChevronDown className="w-4 h-4" />
            </Button>
            {hasSwap && (
              <button className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <RotateCcw className="w-3 h-3" /> {t("ResetToDefault")}
              </button>
            )}
          </div>
        )}

        {isExcluded && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200">
              {t("OptionalSelected")}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
