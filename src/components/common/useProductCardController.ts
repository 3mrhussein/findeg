"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";
import type { ProductCardControllerVM } from "@/components/storefront/types";
import { useDefaultVariantSelection } from "./useDefaultVariantSelection";

/**
 * Encapsulates product card interaction logic (cart/wishlist/navigation).
 */
export function useProductCardController(product: Product): ProductCardControllerVM {
  const { addToCart } = useCart();
  const { isLoggedIn, currentUser, toggleWishlistItem } = useUser();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const selectedVariant = useDefaultVariantSelection(product);

  const isSaved = isLoggedIn && !!currentUser?.wishlist.includes(product.id);

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
   * Toggles wishlist for authenticated users, otherwise routes to registration.
   */
  const handleToggleWishlist = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isLoggedIn) {
      toggleWishlistItem(product.id);
    } else {
      router.push("/registration");
    }
  };

  /**
   * Opens product detail with view transition when supported.
   */
  const handleCardClick = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        startTransition(() => {
          router.push(`/product/${product.id}`);
        });
      });
    } else {
      router.push(`/product/${product.id}`);
    }
  };

  return {
    isSaved,
    isAddingToCart,
    onAddToCart: handleAddToCart,
    onToggleWishlist: handleToggleWishlist,
    onCardClick: handleCardClick,
  };
}
