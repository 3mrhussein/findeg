"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@ui";
import { ShoppingCart, ShoppingBag } from "lucide-react";

interface StickyActionBarProps {
  onReview: () => void;
  total: number;
  itemCount: number;
}

/**
 *
 */
export function StickyActionBar({ onReview, total, itemCount }: StickyActionBarProps) {
  const t = useTranslations("School.ParentExperience.List");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-4 bg-white/80 backdrop-blur-md border-t shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            {t("TotalItems", { count: itemCount })}
          </span>
          <span className="text-xl font-black text-slate-900 leading-none">{total} EGP</span>
        </div>

        <Button
          size="lg"
          onClick={onReview}
          className="h-14 px-8 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          {t("ReviewList")}
        </Button>
      </div>
    </div>
  );
}
