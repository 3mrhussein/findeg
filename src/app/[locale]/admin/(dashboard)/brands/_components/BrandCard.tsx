"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Globe, Box, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { Brand } from "@/features/catalog/domain/entities/Brand";
import Image from "next/image";

interface BrandCardProps {
  brand: Brand;
  isSelected?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export function BrandCard({ brand, isSelected, onEdit, onDelete, onToggleStatus }: BrandCardProps) {
  const t = (useTranslations as any)("Administration.Catalog.Brands");

  const nameEn = brand.localizedContent?.name?.en || brand.name;
  const nameAr = brand.localizedContent?.name?.ar || brand.name;
  const descEn = (brand.localizedContent as any)?.description?.en || "";
  const productCount = brand.productCount || 0;

  return (
    <div
      className={cn(
        "group relative flex items-center p-4 rounded-2xl border transition-all duration-200",
        "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800",
        "hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md hover:shadow-indigo-500/5",
        isSelected &&
          "border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-200 dark:ring-indigo-800",
      )}
    >
      {/* Status Badge - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <StatusBadge status={brand.isActive ? "active" : "inactive"} />
      </div>

      {/* Brand logo (existing) */}
      <div className="relative h-12 w-12 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-indigo-100 transition-colors">
        {brand.logoUrl ? (
          <div className="relative h-full w-full p-2">
            <Image src={brand.logoUrl} alt={nameEn} fill className="object-contain" sizes="64px" />
          </div>
        ) : (
          <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">
            {nameEn.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Brand Info */}
      <div className="flex-1 min-w-0 mx-4">
        <div className="flex flex-col mb-0.5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{nameEn}</h3>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 dir-rtl font-arabic line-clamp-1">
            {nameAr}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 uppercase tracking-tight font-medium opacity-80">
            <Globe className="h-2.5 w-2.5" />
            {brand.slug}
          </div>
          <div className="flex items-center gap-1.5">
            <Box className="h-2.5 w-2.5" />
            {productCount > 0 ? t("ProductsCount", { count: productCount }) : t("NoProducts")}
          </div>
        </div>

        {descEn && (
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 line-clamp-1 max-w-sm italic">
            {descEn}
          </p>
        )}
      </div>

      {/* Actions - Direct Icons */}
      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
        <TooltipProvider>
          {/* Edit Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="h-8 w-8 rounded-md text-slate-400 bg-transparent hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                aria-label="Edit brand"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit brand</p>
            </TooltipContent>
          </Tooltip>

          {/* Toggle Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus();
                }}
                className={cn(
                  "h-8 w-8 rounded-md transition-colors bg-transparent",
                  brand.isActive
                    ? "text-slate-400 hover:text-gray-500 hover:bg-gray-100"
                    : "text-slate-400 hover:text-green-600 hover:bg-green-50",
                )}
                aria-label={brand.isActive ? "Set inactive" : "Set active"}
              >
                {brand.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{brand.isActive ? "Set inactive" : "Set active"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Delete Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-8 w-8 rounded-md text-slate-400 bg-transparent hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Delete brand"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete brand</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Interaction Layer - for clicking the card itself */}
      <button
        className="absolute inset-0 z-0 text-transparent outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 rounded-2xl cursor-pointer"
        onClick={onEdit}
        aria-label={`Edit ${nameEn}`}
      >
        Edit
      </button>
    </div>
  );
}
