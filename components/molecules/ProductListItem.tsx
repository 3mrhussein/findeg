import React from 'react';
import type { Product, PageProps } from '../../types';
import { Button } from '../ui/button';
import { Price } from '../atoms/Price';
import { useCart, useTranslation } from '../../hooks';
import { Icon } from '../atoms/Icon';

interface ProductListItemUIProps extends PageProps {
  product: Product;
  onAddToCart: (e: React.MouseEvent) => void;
  addToCartText: string;
}

export const ProductListItemUI: React.FC<ProductListItemUIProps> = ({ product, navigateTo, onAddToCart, addToCartText }) => {
  const handleCardClick = () => {
    navigateTo('product', product.id);
  };

  return (
    <div 
        className="bg-card rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl border flex flex-col sm:flex-row cursor-pointer"
        onClick={handleCardClick}
    >
      <div className="sm:w-1/3">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 sm:h-full object-cover" />
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

// FIX: Add container component to handle logic and provide props to UI component.
interface ProductListItemProps extends PageProps {
    product: Product;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({ product, navigateTo }) => {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    
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

    return (
        <ProductListItemUI
            product={product}
            navigateTo={navigateTo}
            onAddToCart={handleAddToCart}
            addToCartText={t('product_card_add_to_cart')}
        />
    );
};