"use client";

import { Button } from "@/components/ui/button";
import { VariantSelector } from "./VariantSelector";
import { QuantityInput } from "@/components/common/QuantityInput";
import type { Product } from "@/features/catalog/domain/entities/Product";

interface ProductActionsViewProps {
  product: Product;
  isAddingToCart: boolean;
  quantity: number;
  selectedVariants: { [key: string]: string };
  addToCartLabel: string;
  addToCartLoadingLabel: string;
  onQuantityChange: (quantity: number) => void;
  onVariantChange: (variantName: string, value: string) => void;
  onAddToCart: () => void;
}

/**
 * Pure view for product detail cart actions.
 */
export function ProductActionsView({
  product,
  isAddingToCart,
  quantity,
  selectedVariants,
  addToCartLabel,
  addToCartLoadingLabel,
  onQuantityChange,
  onVariantChange,
  onAddToCart,
}: ProductActionsViewProps) {
  return (
    <div className="mt-8">
      {product.variants &&
        Object.keys(product.variants).map((variantName) => (
          <VariantSelector
            key={variantName}
            variant={product.variants![variantName]}
            selectedValue={selectedVariants[variantName]}
            onValueChange={(value) => onVariantChange(variantName, value)}
          />
        ))}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6 lg:mt-8">
        <div className="w-full sm:w-auto">
          <QuantityInput quantity={quantity} setQuantity={onQuantityChange} />
        </div>
        <Button size="lg" className="w-full" onClick={onAddToCart} disabled={isAddingToCart}>
          {isAddingToCart ? addToCartLoadingLabel : addToCartLabel}
        </Button>
      </div>
    </div>
  );
}
