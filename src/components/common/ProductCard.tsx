"use client";

import React from "react";
import Image from "next/image";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/common/Price";
import { DiscountBadge } from "@/components/common/DiscountBadge";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { useProductCardController } from "./useProductCardController";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

/**
 *
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const t = useTranslations();
  const { toast } = useToast();
  const { isSaved, isAddingToCart, onAddToCart, onToggleWishlist, onCardClick } =
    useProductCardController(product);

  const handleAddToCart = (event: React.MouseEvent) => {
    onAddToCart(event);
    toast({
      title: t("Feedback.CartAddedTitle"),
      description: t("Feedback.CartAddedDescription", { name: product.name }),
    });
  };

  const handleWishlist = (event: React.MouseEvent) => {
    onToggleWishlist?.(event);
  };

  return (
    <div
      className="bg-card rounded-lg shadow-md overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border flex flex-col cursor-pointer"
      onClick={onCardClick}
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
            onClick={handleWishlist}
            aria-label={t("Pages.ProductCard.Save")}
            className={
              isSaved
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "bg-muted text-muted-foreground hover:bg-border"
            }
          >
            <Icon name="bookmark" className="w-5 h-5" />
          </Button>
        </div>
        {product.strikePrice ? (
          <DiscountBadge
            price={product.price}
            strikePrice={product.strikePrice}
            className="absolute top-3 ltr:right-3 rtl:left-3"
          />
        ) : null}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-sm text-muted-foreground">{product.categoryName}</span>
        <h3 className="text-lg font-semibold text-card-foreground truncate mt-1">{product.name}</h3>
        <Price price={product.price} strikePrice={product.strikePrice} className="mt-2" />
        <Button className="w-full mt-auto" onClick={handleAddToCart} disabled={isAddingToCart}>
          <Icon name="shoppingCart" className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
          {isAddingToCart ? t("Feedback.AddingToCart") : t("Pages.ProductCard.AddToCart")}
        </Button>
      </div>
    </div>
  );
};
