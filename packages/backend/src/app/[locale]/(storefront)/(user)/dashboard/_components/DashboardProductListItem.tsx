"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/features/catalog/domain/entities/Product";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { useTranslations } from "next-intl";
import { useCart } from "@/hooks/useCart";
import { Icon } from "@/components/shared/Icon";

interface ProductListItemUIProps {
  product: Product;
  onAddToCart: (e: React.MouseEvent) => void;
  addToCartText: string;
  onCardClick: () => void;
}

/**
 *
 */
export const ProductListItemUI: React.FC<ProductListItemUIProps> = ({
  product,
  onAddToCart,
  addToCartText,
  onCardClick,
}) => {
  return (
    <div
      className="bg-card rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl border flex flex-col sm:flex-row cursor-pointer"
      onClick={onCardClick}
    >
      <div className="sm:w-1/3">
        <Image
          src={
            product.variants?.[0]?.images?.[0]?.url ||
            product.mediaSet?.card?.url ||
            product.mediaSet?.thumbnail?.url ||
            "/placeholder.png"
          }
          alt={product.name}
          width={400}
          height={300}
          className="w-full h-48 sm:h-full object-cover"
        />
      </div>
      <div className="p-5 flex flex-col grow sm:w-2/3">
        <span className="text-sm text-muted-foreground">{product.categoryName}</span>
        <h3 className="text-lg font-semibold text-card-foreground mt-1">{product.name}</h3>
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{product.description}</p>
        <div className="grow"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
          <Price
            price={product.variants?.[0]?.basePrice || 0}
            strikePrice={product.variants?.[0]?.strikePrice}
            className="mb-3 sm:mb-0"
          />
          <Button onClick={onAddToCart}>
            <Icon name="shopping_cart" className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
            {addToCartText}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ProductListItemProps {
  product: Product;
}

/**
 *
 */
export const ProductListItem: React.FC<ProductListItemProps> = ({ product }) => {
  const t = useTranslations();
  const { addToCart } = useCart();
  const router = useRouter();

  /**
   *
   */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const variants = product.variants || [];
    const defaultVariant = variants.find((v) => v.variantKey === "default") || variants[0];

    if (defaultVariant) {
      addToCart(product.id, 1, {
        variantId: defaultVariant.id,
        uomCode: "pcs",
      });
    }
  };

  /**
   *
   */
  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <ProductListItemUI
      product={product}
      onAddToCart={handleAddToCart}
      addToCartText={t("Pages.ProductCard.AddToCart")}
      onCardClick={handleCardClick}
    />
  );
};
