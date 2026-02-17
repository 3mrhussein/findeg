"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/features/catalog/domain/entities/Product";

interface UseProductActionsControllerResult {
  isAddingToCart: boolean;
  quantity: number;
  selectedVariants: { [key: string]: string };
  setQuantity: (value: number) => void;
  setSelectedVariantValue: (variantName: string, value: string) => void;
  handleAddToCart: () => void;
}

/**
 * Encapsulates product detail purchase actions state and handlers.
 */
export function useProductActionsController(product: Product): UseProductActionsControllerResult {
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});

  /**
   * Updates the selected option for a variant axis.
   */
  const setSelectedVariantValue = (variantName: string, value: string) => {
    setSelectedVariants((previous) => ({ ...previous, [variantName]: value }));
  };

  /**
   * Adds product with current selections to cart.
   */
  const handleAddToCart = () => {
    setIsAddingToCart(true);
    addToCart(product, quantity, selectedVariants);
    setTimeout(() => setIsAddingToCart(false), 500);
  };

  return {
    isAddingToCart,
    quantity,
    selectedVariants,
    setQuantity,
    setSelectedVariantValue,
    handleAddToCart,
  };
}
