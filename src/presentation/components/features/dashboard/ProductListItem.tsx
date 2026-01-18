'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';
import { Button } from '@/presentation/components/ui/button';
import { Price } from '@/presentation/components/shared/Price';
import { useCart, useTranslation } from '@/presentation/hooks';
import { Icon } from '@/presentation/components/shared/Icon';

interface ProductListItemUIProps {
  product: Product;
  onAddToCart: (e: React.MouseEvent) => void;
  addToCartText: string;
  onCardClick: () => void;
}

export const ProductListItemUI: React.FC<ProductListItemUIProps> = ({ product, onAddToCart, addToCartText, onCardClick }) => {
  return (
    <div 
        className="bg-card rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl border flex flex-col sm:flex-row cursor-pointer"
        onClick={onCardClick}
    >
      <div className="sm:w-1/3">
        <Image 
          src={product.imageUrl || '/placeholder.png'}
          alt={product.name} 
          width={400} 
          height={300} 
          className="w-full h-48 sm:h-full object-cover" 
        />
      </div>
      <div className="p-5 flex flex-col flex-grow sm:w-2/3">
        <span className="text-sm text-muted-foreground">{product.category}</span>
        <h3 className="text-lg font-semibold text-card-foreground mt-1">{product.name}</h3>
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{product.description}</p>
        <div className="flex-grow"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
            <Price price={product.price} strikePrice={product.strikePrice} className="mb-3 sm:mb-0" />
            <Button onClick={onAddToCart}>
                <Icon name="shoppingCart" className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
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

export const ProductListItem: React.FC<ProductListItemProps> = ({ product }) => {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const router = useRouter();
    
    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        // For products with variants, add the first available variant by default.
        let selectedVariant;
        if (product.variants) {
            selectedVariant = Object.keys(product.variants).reduce((acc, key) => {
                const firstAvailableOption = product.variants?.[key].options.find(opt => opt.stock > 0);
                if (firstAvailableOption) {
                    acc[key] = firstAvailableOption.value;
                }
                return acc;
            }, {} as {[key: string]: string});
        }
        addToCart(product, 1, selectedVariant);
    };

    const handleCardClick = () => {
        router.push(`/product/${product.id}`);
    };

    return (
        <ProductListItemUI
            product={product}
            onAddToCart={handleAddToCart}
            addToCartText={t('product_card_add_to_cart')}
            onCardClick={handleCardClick}
        />
    );
};