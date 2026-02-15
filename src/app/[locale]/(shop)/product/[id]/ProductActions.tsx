"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { VariantSelector } from "./VariantSelector";
import { QuantityInput } from "@/components/common/QuantityInput";
import { useTranslations } from "next-intl";
import { useCart } from "@/hooks/useCart";
import { Product } from "@/features/catalog/domain/entities/Product";

interface ProductActionsProps {
  product: Product;
}

/**
 *
 */
export const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const t = useTranslations();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});

  /**
   *
   */
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariants);
  };

  return (
    <div className="mt-8">
      {product.variants &&
        Object.keys(product.variants).map((variantName) => (
          <VariantSelector
            key={variantName}
            variant={product.variants![variantName]}
            selectedValue={selectedVariants[variantName]}
            onValueChange={(value) =>
              setSelectedVariants((prev) => ({ ...prev, [variantName]: value }))
            }
          />
        ))}

      <div className="flex items-center gap-4 mt-8">
        <QuantityInput quantity={quantity} setQuantity={setQuantity} />
        <Button size="lg" className="w-full" onClick={handleAddToCart}>
          {t("Pages.ProductDetail.AddToCart")}
        </Button>
      </div>
    </div>
  );
};
