"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { useCart } from "@/hooks/useCart";
import type { ProductListItemControllerVM } from "@/components/storefront/types";
import { useDefaultVariantSelection } from "./useDefaultVariantSelection";

/**
 * Encapsulates product list-item interactions for list view.
 */
export function useProductListItemController(product: Product): ProductListItemControllerVM {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const selectedVariant = useDefaultVariantSelection(product);

  /**
   * Adds product to cart with first available options selected for each variant.
   */
  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsAddingToCart(true);
    addToCart(product, 1, selectedVariant);
    setTimeout(() => setIsAddingToCart(false), 500);
  };

  /**
   * Navigates to product detail page.
   */
  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  return {
    isAddingToCart,
    onAddToCart: handleAddToCart,
    onCardClick: handleCardClick,
  };
}
