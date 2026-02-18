"use client";

import { useCart } from "@/hooks/useCart";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/common/Price";

interface SchoolListResultsProps {
  products: Product[];
  totalEstimatedCost: number;
}

/**
 * Renders school-list products and supports add-item/add-bundle cart actions.
 */
export function SchoolListResults({ products, totalEstimatedCost }: SchoolListResultsProps) {
  const t = useTranslations();
  const { addToCart } = useCart();

  /**
   *
   */
  function addBundleToCart() {
    products.forEach((product) => {
      addToCart(product, 1);
    });
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="space-y-3">
        <CardTitle>{t("Pages.SchoolLists.BundleTitle")}</CardTitle>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground md:flex-row md:justify-between">
          <span>{t("Pages.SchoolLists.ItemsCount", { count: products.length })}</span>
          <span>
            {t("Pages.SchoolLists.EstimatedCost")}:{" "}
            {new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" }).format(
              totalEstimatedCost,
            )}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-1">
              <p className="font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.categoryName || product.sku}</p>
            </div>
            <div className="flex items-center gap-3">
              <Price price={product.price} />
              <Button variant="outline" onClick={() => addToCart(product, 1)}>
                {t("Pages.ProductCard.AddToCart")}
              </Button>
            </div>
          </div>
        ))}
        <div className="pt-2">
          <Button size="lg" className="w-full md:w-auto" onClick={addBundleToCart}>
            {t("Pages.SchoolLists.AddBundleToCart")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
