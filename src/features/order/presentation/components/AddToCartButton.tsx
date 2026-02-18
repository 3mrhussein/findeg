"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { Product } from "@/features/catalog/domain/entities/Product";
import { useTranslations } from "next-intl";

interface AddToCartButtonProps {
  product?: Product;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

/**
 *
 */
export function AddToCartButton({ product, size = "default", className }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const t = useTranslations();

  /**
   *
   */
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1);
    }
  };

  return (
    <Button
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={!product}
      data-testid={product ? `product-detail-add-to-cart-${product.id}` : "product-detail-add-to-cart"}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {t("Pages.ProductCard.AddToCart")}
    </Button>
  );
}
