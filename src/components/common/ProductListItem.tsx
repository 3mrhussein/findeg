"use client";

import React from "react";
import Image from "next/image";
import { Product } from "@/features/catalog/domain/entities/Product";

import { Icon } from "@/components/common/Icon";
import { Price } from "@/components/common/Price";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useProductListItemController } from "./useProductListItemController";
import { useToast } from "@/hooks/use-toast";

interface ProductListItemProps {
  product: Product;
}

/**
 *
 */
export const ProductListItem: React.FC<ProductListItemProps> = ({ product }) => {
  const t = useTranslations();
  const { toast } = useToast();
  const { isAddingToCart, onAddToCart, onCardClick } = useProductListItemController(product);

  const handleAddToCart = (event: React.MouseEvent) => {
    onAddToCart(event);
    toast({
      title: t("Feedback.CartAddedTitle"),
      description: t("Feedback.CartAddedDescription", { name: product.name }),
    });
  };

  return (
    <div
      className="bg-card rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl border flex flex-col sm:flex-row cursor-pointer"
      onClick={onCardClick}
    >
      <div className="sm:w-1/3">
        <Image
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          width={400}
          height={300}
          className="w-full h-48 sm:h-full object-cover"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow sm:w-2/3">
        <span className="text-sm text-muted-foreground">{product.categoryName}</span>
        <h3 className="text-lg font-semibold text-card-foreground mt-1">{product.name}</h3>
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{product.description}</p>
        <div className="flex-grow"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
          <Price price={product.price} strikePrice={product.strikePrice} className="mb-3 sm:mb-0" />
          <Button onClick={handleAddToCart} disabled={isAddingToCart}>
            <Icon name="shoppingCart" className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
            {isAddingToCart ? t("Feedback.AddingToCart") : t("Pages.ProductCard.AddToCart")}
          </Button>
        </div>
      </div>
    </div>
  );
};
