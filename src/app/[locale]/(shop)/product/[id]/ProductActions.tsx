"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Product } from "@/features/catalog/domain/entities/Product";
import { ProductActionsView } from "./ProductActionsView";
import { useProductActionsController } from "./useProductActionsController";
import { useToast } from "@/hooks/use-toast";

interface ProductActionsProps {
  product: Product;
}

/**
 *
 */
export const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const t = useTranslations();
  const { toast } = useToast();
  const {
    isAddingToCart,
    quantity,
    selectedVariants,
    setQuantity,
    setSelectedVariantValue,
    handleAddToCart,
  } = useProductActionsController(product);

  /**
   * Handles add-to-cart action and shows a confirmation toast.
   */
  const onAddToCart = () => {
    handleAddToCart();
    toast({
      title: t("Feedback.CartAddedTitle"),
      description: t("Feedback.CartAddedDescription", { name: product.name }),
    });
  };

  return (
    <ProductActionsView
      product={product}
      isAddingToCart={isAddingToCart}
      quantity={quantity}
      selectedVariants={selectedVariants}
      addToCartLabel={t("Pages.ProductDetail.AddToCart")}
      addToCartLoadingLabel={t("Feedback.AddingToCart")}
      onQuantityChange={setQuantity}
      onVariantChange={setSelectedVariantValue}
      onAddToCart={onAddToCart}
    />
  );
};
