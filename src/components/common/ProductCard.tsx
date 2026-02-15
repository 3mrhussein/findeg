"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/common/Price";
import { DiscountBadge } from "@/components/common/DiscountBadge";
import { useTranslations } from "next-intl";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";
import { Icon } from "@/components/common/Icon";

interface ProductCardUIProps {
  product: Product;
  onAddToCart: (e: React.MouseEvent) => void;
  onToggleWishlist: (e: React.MouseEvent) => void;
  isSaved: boolean;
  addToCartText: string;
  likeText: string;
  saveText: string;
  onCardClick: () => void;
}

/**
 *
 */
export const ProductCardUI: React.FC<ProductCardUIProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isSaved,
  addToCartText,
  likeText,
  saveText,
  onCardClick,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  /**
   *
   */
  const handleIconClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div
      className="bg-card rounded-lg shadow-md overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border flex flex-col cursor-pointer"
      onClick={onCardClick}
      style={{ viewTransitionName: `product-${product.id}` } as any}
    >
      <div className="relative">
        <Image
          src={product.imageUrl || product.images[0]}
          alt={product.name}
          width={400}
          height={224}
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-3 ltr:left-3 rtl:right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            onClick={(e) => handleIconClick(e, () => setIsLiked(!isLiked))}
            aria-label={likeText}
            className={
              isLiked
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                : "bg-muted text-muted-foreground hover:bg-border"
            }
          >
            <Icon name="heart" className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={onToggleWishlist}
            aria-label={saveText}
            className={
              isSaved
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "bg-muted text-muted-foreground hover:bg-border"
            }
          >
            <Icon name="bookmark" className="w-5 h-5" />
          </Button>
        </div>
        {product.strikePrice && (
          <DiscountBadge
            price={product.price}
            strikePrice={product.strikePrice}
            className="absolute top-3 ltr:right-3 rtl:left-3"
          />
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-sm text-muted-foreground">{product.categoryName}</span>
        <h3 className="text-lg font-semibold text-card-foreground truncate mt-1">{product.name}</h3>
        <Price price={product.price} strikePrice={product.strikePrice} className="mt-2" />
        <Button className="w-full mt-auto" onClick={onAddToCart}>
          <Icon name="shoppingCart" className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
          {addToCartText}
        </Button>
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
}

/**
 *
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const t = useTranslations();
  const { addToCart } = useCart();
  const { isLoggedIn, currentUser, toggleWishlistItem } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isSaved = isLoggedIn && !!currentUser?.wishlist.includes(product.id);

  /**
   *
   */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    let selectedVariant;
    if (product.variants) {
      selectedVariant = Object.keys(product.variants).reduce(
        (acc, key) => {
          const firstAvailableOption = product.variants?.[key].options.find((opt) => opt.stock > 0);
          if (firstAvailableOption) {
            acc[key] = firstAvailableOption.value;
          }
          return acc;
        },
        {} as { [key: string]: string },
      );
    }
    addToCart(product, 1, selectedVariant);
  };

  /**
   *
   */
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoggedIn) {
      toggleWishlistItem(product.id);
    } else {
      router.push("/registration");
    }
  };

  /**
   *
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

  return (
    <ProductCardUI
      product={product}
      onAddToCart={handleAddToCart}
      onToggleWishlist={handleToggleWishlist}
      isSaved={isSaved}
      addToCartText={t("Pages.ProductCard.AddToCart")}
      likeText={t("Pages.ProductCard.Like")}
      saveText={t("Pages.ProductCard.Save")}
      onCardClick={handleCardClick}
    />
  );
};
