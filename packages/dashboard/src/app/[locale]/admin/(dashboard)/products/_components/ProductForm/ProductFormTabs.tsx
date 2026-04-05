"use client";

import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { type ProductFormValues } from "@/features/administration/presentation/forms/product-form";
import {
  Info,
  Layers,
  Image as ImageIcon,
  CircleDollarSign,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: "complete" | "warning" | "error" | "default";
}

interface ProductFormTabsProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

/**
 * Tab navigation for Product Form with completion indicators
 */
export function ProductFormTabs({ activeTab, onTabChange }: ProductFormTabsProps) {
  const t = useTranslations("Administration.Catalog.Products.Form.Tabs");
  const { control } = useFormContext<ProductFormValues>();

  // Watch all values to compute status
  const values = useWatch({ control });

  const getTabStatus = (tabId: string): TabItem["status"] => {
    switch (tabId) {
      case "info": {
        const enName = values.localizedName?.en?.trim();
        const arName = values.localizedName?.ar?.trim();
        if (enName && arName) return "complete";
        if (enName || arName) return "warning";
        return "error";
      }
      case "variants": {
        const variants = values.variants || [];
        if (variants.length === 0) return "error";
        const hasIncomplete = variants.some(
          (v) => !v.sku?.trim() || !v.basePrice || v.basePrice <= 0,
        );
        return hasIncomplete ? "warning" : "default";
      }
      case "pricing": {
        // Warning only if UoMs exist but are incomplete
        const firstVariantUoms = values.variants?.[0]?.uoms || [];
        const hasIncomplete = firstVariantUoms.some((u) => !u.uomCode?.trim() || !u.factorToBase);
        return hasIncomplete ? "warning" : "default";
      }
      case "media":
      case "seo":
      default:
        return "default";
    }
  };

  const tabs: TabItem[] = [
    {
      id: "info",
      label: t("info"),
      icon: <Info className="h-4 w-4" />,
      status: getTabStatus("info"),
    },
    {
      id: "variants",
      label: t("variants"),
      icon: <Layers className="h-4 w-4" />,
      status: getTabStatus("variants"),
    },
    { id: "media", label: t("media"), icon: <ImageIcon className="h-4 w-4" />, status: "default" },
    {
      id: "pricing",
      label: t("pricing"),
      icon: <CircleDollarSign className="h-4 w-4" />,
      status: getTabStatus("pricing"),
    },
    { id: "seo", label: t("seo"), icon: <Search className="h-4 w-4" />, status: "default" },
  ];

  const getStatusIcon = (status: TabItem["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-3 w-3 text-amber-500" />;
      case "error":
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full border-b bg-background px-6">
      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
            {getStatusIcon(tab.status)}
          </button>
        ))}
      </nav>
    </div>
  );
}
