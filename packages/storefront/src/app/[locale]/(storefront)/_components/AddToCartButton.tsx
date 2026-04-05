"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@findeg/ui";
import { useCart } from "@/hooks/useCart";
import { Product } from "@/features/catalog/domain/entities/Product";
import { useTranslations } from "next-intl";

interface AddToCartButtonProps {
  productId: number;
  variantId: number;
  uomCode?: string;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  quantity?: number;
  disabled?: boolean;
}

/**
 * AddToCartButton
 *
 * A reusable button that interacts with the CartContext.
 * Now requires a specific variantId and optionally a uomCode.
 */
export function AddToCartButton({
  productId,
  variantId,
  uomCode = "pcs",
  size = "default",
  className,
  quantity = 1,
  disabled,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const t = useTranslations();

  /**
   *
   */
  const handleAddToCart = () => {
    addToCart(productId, quantity, { variantId, uomCode: uomCode as any });
  };

  return (
    <Button
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={disabled}
      data-testid={`add-to-cart-${variantId}`}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {t("Pages.ProductCard.AddToCart")}
    </Button>
  );
}
