import React, { useState } from 'react';
import type { Product, PageProps } from '../../types';
import { Button } from '../ui/button';
import { Price } from '../atoms/Price';
import { DiscountBadge } from '../atoms/DiscountBadge';
import { useCart, useTranslation, useUser } from '../../hooks';
import { Icon } from '../atoms/Icon';

interface ProductCardUIProps extends PageProps {
  product: Product;
  onAddToCart: (e: React.MouseEvent) => void;
  onToggleWishlist: (e: React.MouseEvent) => void;
  isSaved: boolean;
  addToCartText: string;
  likeText: string;
  saveText: string;
}

export const ProductCardUI: React.FC<ProductCardUIProps> = ({ 
    product, 
    navigateTo, 
    onAddToCart, 
    onToggleWishlist,
    isSaved,
    addToCartText, 
    likeText, 
    saveText 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  
  const handleCardClick = () => {
    navigateTo('product', product.id);
  };

  const handleIconClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div 
        className="bg-card rounded-lg shadow-md overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border flex flex-col cursor-pointer"
        onClick={handleCardClick}
    >
      <div className="relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-56 object-cover" />
        <div className="absolute top-3 ltr:left-3 rtl:right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
                size="icon"
                onClick={(e) => handleIconClick(e, () => setIsLiked(!isLiked))} 
                aria-label={likeText}
                className={isLiked ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-muted text-muted-foreground hover:bg-border'}
            >
                <Icon name="heart" className="w-5 h-5" />
            </Button>
            <Button 
                size="icon"
                onClick={onToggleWishlist}
                aria-label={saveText}
                className={isSaved ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-muted text-muted-foreground hover:bg-border'}
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
        <span className="text-sm text-muted-foreground">{product.category}</span>
        <h3 className="text-lg font-semibold text-card-foreground truncate mt-1">{product.name}</h3>
        <Price price={product.price} strikePrice={product.strikePrice} className="mt-2" />
        <Button className="w-full mt-4 mt-auto" onClick={onAddToCart}>
            <Icon name="shoppingCart" className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
            {addToCartText}
        </Button>
      </div>
    </div>
  );
};

interface ProductCardProps extends PageProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigateTo }) => {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const { isLoggedIn, currentUser, toggleWishlistItem } = useUser();

    const isSaved = isLoggedIn && !!currentUser?.wishlist.includes(product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
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

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoggedIn) {
            toggleWishlistItem(product.id);
        } else {
            navigateTo('registration');
        }
    }
    
    return (
        <ProductCardUI 
            product={product}
            navigateTo={navigateTo}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isSaved={isSaved}
            addToCartText={t('product_card_add_to_cart')}
            likeText={t('product_card_like')}
            saveText={t('product_card_save')}
        />
    );
};