"use client";

import React from "react";
import { useRouter } from "@i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@findeg/ui";
import { ChevronLeft, Save, Globe } from "lucide-react";
import { Separator } from "@findeg/ui";

interface ProductFormHeaderProps {
  isEdit: boolean;
  isPending: boolean;
  onSaveDraft: () => void;
  productName?: string;
}

/**
 * Sticky header for the Product Form
 */
export function ProductFormHeader({
  isEdit,
  isPending,
  onSaveDraft,
  productName,
}: ProductFormHeaderProps) {
  const t = useTranslations("Administration.Catalog.Products.Form");
  const router = useRouter();

  const displayTitle = isEdit
    ? productName
      ? `${t("editProduct")} ${productName.length > 40 ? productName.slice(0, 40) + "…" : productName}`
      : t("editProduct")
    : t("newProduct");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6 gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <h1 className="text-base font-semibold truncate">{displayTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={isPending} onClick={onSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            {t("saveDraft")}
          </Button>
          <Button size="sm" type="submit" disabled={isPending}>
            <Globe className="mr-2 h-4 w-4" />
            {t("publish")}
          </Button>
        </div>
      </div>
    </header>
  );
}
