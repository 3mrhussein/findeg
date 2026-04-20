/**
 * ProductFormTabs — Tab navigation for product edit form
 *
 * Tabs:
 * - Info (product details, descriptions)
 * - Variants (SKUs, pricing, stock per variant)
 * - Media (images, gallery)
 * - Pricing & UoMs (units of measure, price lists)
 * - SEO (slugs, meta tags, search preview)
 *
 * Syncs with URL query param ?tab=variants
 *
 * Location: src/app/[locale]/admin/(dashboard)/products/[id]/edit/_components/
 * Used by: ProductEditForm (edit mode only)
 */

"use client";

import * as React from "react";
import { useRouter, usePathname } from "@i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@findeg/ui";
import { FileText, Layers, Image, DollarSign, Search } from "lucide-react";
import { cn } from "@lib/utils";

export type ProductTab = "info" | "variants" | "media" | "pricing" | "seo";

interface ProductFormTabsProps {
  /** Tab content components */
  children: Record<ProductTab, React.ReactNode>;
  /** Default tab (if no URL param) */
  defaultTab?: ProductTab;
  /** Additional CSS classes */
  className?: string;
}

const TAB_CONFIG: Record<ProductTab, { label: string; icon: React.ElementType }> = {
  info: { label: "Info", icon: FileText },
  variants: { label: "Variants", icon: Layers },
  media: { label: "Media", icon: Image },
  pricing: { label: "Pricing & UoMs", icon: DollarSign },
  seo: { label: "SEO", icon: Search },
};

/**
 * ProductFormTabs — Tabbed navigation for edit form
 *
 * Syncs selected tab with URL search params for:
 * - Shareable deep links
 * - Browser back/forward navigation
 * - Page refresh persistence
 *
 * @example
 * <ProductFormTabs defaultTab="info">
 *   {{
 *     info: <InfoTab />,
 *     variants: <VariantsTab />,
 *     media: <MediaTab />,
 *     pricing: <PricingTab />,
 *     seo: <SeoTab />,
 *   }}
 * </ProductFormTabs>
 */
export function ProductFormTabs({
  children,
  defaultTab = "info",
  className,
}: ProductFormTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current tab from URL or use default
  const currentTab = (searchParams.get("tab") as ProductTab) || defaultTab;

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className={cn("w-full", className)}>
      {/* Tab Navigation */}
      <TabsList className="grid w-full grid-cols-5 mb-6">
        {Object.entries(TAB_CONFIG).map(([key, { label, icon: Icon }]) => (
          <TabsTrigger key={key} value={key} className="gap-2">
            <Icon className="h-4 w-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Tab Content */}
      {Object.entries(children).map(([key, content]) => (
        <TabsContent key={key} value={key} className="mt-0">
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
