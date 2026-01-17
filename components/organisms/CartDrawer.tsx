import React from 'react';
import type { PageProps, CartItem } from '../../types';
import { Button } from '../ui/button';
import { QuantityInput } from '../atoms/QuantityInput';
import { useCart, useTranslation } from '../../hooks';
import { Icon } from '../atoms/Icon';

interface CartDrawerUIProps extends PageProps {
    isOpen: boolean;
    onToggle: () => void;
    items: CartItem[];
    onRemove: (itemId: number, variantId?: string) => void;
    onUpdateQuantity: (itemId: number, quantity: number, variantId?: string) => void;
    total: number;
    title: string;
    emptyText: string;
    subtotalText: string;
    checkoutText: string;
    removeItemText: string;
    shopNowText: string;
}

export const CartDrawerUI: React.FC<CartDrawerUIProps> = ({ 
    navigateTo, 
    isOpen, 
    onToggle, 
    items, 
    onRemove, 
    onUpdateQuantity, 
    total,
    title,
    emptyText,
    subtotalText,
    checkoutText,
    removeItemText,
    shopNowText
}) => {
    const handleCheckout = () => {
        onToggle();
        navigateTo('checkout');
    }
    
    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onToggle}
            />

            {/* Drawer */}
            <div className={`fixed top-0 ltr:right-0 rtl:left-0 h-full w-full max-w-md bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Close cart">
                            <Icon name="x" className="w-6 h-6 text-foreground" />
                        </Button>
                    </div>
                    
                    {items.length > 0 ? (
                        <>
                            <div className="flex-grow overflow-y-auto p-6 space-y-4">
                                {items.map(item => (
                                    <div key={`${item.id}-${JSON.stringify(item.selectedVariant)}`} className="flex gap-4">
                                        <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                                        <div className="flex-grow">
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <QuantityInput 
                                                    quantity={item.quantity} 
                                                    setQuantity={(q) => onUpdateQuantity(item.id, q, JSON.stringify(item.selectedVariant))} 
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => onRemove(item.id, JSON.stringify(item.selectedVariant))} aria-label={removeItemText}>
                                                    <Icon name="trash" className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 border-t mt-auto">
                                <div className="flex justify-between items-center font-bold text-lg mb-4">
                                    <span>{subtotalText}</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <Button size="lg" className="w-full" onClick={handleCheckout}>{checkoutText}</Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                            <p className="text-muted-foreground">{emptyText}</p>
                            <Button onClick={() => {onToggle(); navigateTo('shop')}} className="mt-4">{shopNowText}</Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// FIX: Add container component to handle logic and provide props to UI component.
export const CartDrawer: React.FC<PageProps> = ({ navigateTo }) => {
    const { isCartOpen, toggleCart, cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
    const { t } = useTranslation();
    
    return (
        <CartDrawerUI 
            navigateTo={navigateTo}
            isOpen={isCartOpen}
            onToggle={toggleCart}
            items={cartItems}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            total={cartTotal}
            title={t('cart_title')}
            emptyText={t('cart_empty')}
            subtotalText={t('cart_subtotal')}
            checkoutText={t('cart_checkout')}
            removeItemText={t('cart_remove_item')}
            shopNowText={t('hero_button_shop')}
        />
    );
};