"use client";

import { Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Product } from "@backend/features/catalog/domain/entities/Product";
import { ProductCard } from "../../../_components/ProductCard";

interface RelatedProductsRailProps {
  products: Product[];
}

/**
 * Horizontal related-products strip for PDP.
 */
export function RelatedProductsRail({ products }: RelatedProductsRailProps) {
  const t = useTranslations("Pages.ProductDetail");

  if (!products.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="inline-flex items-center gap-2 text-xl font-bold text-foreground">
        <Link2 className="size-5" />
        {t("CustomersAlsoBought")}
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.map((product) => (
          <div key={product.id} className="min-w-[250px] max-w-[280px] shrink-0">
            <ProductCard product={product} view="grid" />
          </div>
        ))}
      </div>
    </section>
  );
}
