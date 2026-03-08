"use client";

import { FileText, Package, Ruler, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { Variant } from "@/features/catalog/domain/entities/Variant";
import type { ProductReviewSummary } from "@/features/review/application/interfaces/IReviewRepository";
import type { Review } from "@/features/review/domain/entities/Review";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { ReviewsSection } from "./ReviewsSection";

interface ProductTabsSectionProps {
  product: Product;
  selectedVariant?: Variant;
  activeTab: string;
  onActiveTabChange: (value: string) => void;
  reviewSummary: ProductReviewSummary;
  initialReviews: Review[];
  reviewTotal: number;
}

/**
 * PDP tabs for description, specs, reviews and shipping/returns.
 */
export function ProductTabsSection({
  product,
  selectedVariant,
  activeTab,
  onActiveTabChange,
  reviewSummary,
  initialReviews,
  reviewTotal,
}: ProductTabsSectionProps) {
  const t = useTranslations("Pages.ProductDetail");

  const description = sanitizeHtml(product.longDescription || product.description || "");

  return (
    <section id="pdp-tabs" className="space-y-4">
      <Tabs value={activeTab} onValueChange={onActiveTabChange}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="description" className="gap-2 rounded-full border px-4 py-2">
            <FileText className="size-4" />
            {t("Description")}
          </TabsTrigger>
          <TabsTrigger value="specifications" className="gap-2 rounded-full border px-4 py-2">
            <Ruler className="size-4" />
            {t("Specifications")}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2 rounded-full border px-4 py-2">
            <Star className="size-4" />
            {t("Reviews")}
            <span className="text-xs text-muted-foreground">({reviewTotal})</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2 rounded-full border px-4 py-2">
            <Package className="size-4" />
            {t("ShippingReturns")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <article
            className="prose prose-sm max-w-none rounded-2xl border bg-card p-4 text-foreground dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: description || `<p>${product.description}</p>` }}
          />
        </TabsContent>

        <TabsContent value="specifications" className="mt-4">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="w-1/3 bg-muted/30 px-4 py-3 font-medium">{t("SkuLabel")}</td>
                  <td className="px-4 py-3">{selectedVariant?.sku || "-"}</td>
                </tr>
                <tr className="border-b">
                  <td className="w-1/3 bg-muted/30 px-4 py-3 font-medium">{t("BarcodeLabel")}</td>
                  <td className="px-4 py-3">{selectedVariant?.barcode || "-"}</td>
                </tr>
                {(selectedVariant?.attributes || []).map((attribute) => (
                  <tr key={`${attribute.key}-${attribute.attributeId}`} className="border-b last:border-b-0">
                    <td className="w-1/3 bg-muted/30 px-4 py-3 font-medium">{attribute.key}</td>
                    <td className="px-4 py-3">
                      {attribute.valueText || attribute.valueNum || String(attribute.valueBool ?? "-")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4" id="reviews-tab-panel">
          <ReviewsSection
            productId={product.id}
            initialReviews={initialReviews}
            initialSummary={reviewSummary}
            initialTotal={reviewTotal}
          />
        </TabsContent>

        <TabsContent value="shipping" className="mt-4">
          <div className="rounded-2xl border bg-card p-4 text-sm text-foreground/90">
            <h3 className="mb-2 text-base font-semibold">{t("ShippingTitle")}</h3>
            <p className="mb-4 text-muted-foreground">{t("ShippingDescription")}</p>
            <h3 className="mb-2 text-base font-semibold">{t("ReturnsTitle")}</h3>
            <p className="text-muted-foreground">{t("ReturnsDescription")}</p>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
