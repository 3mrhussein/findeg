"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { QuantityInput } from "@/components/common/QuantityInput";
import { Icon } from "@/components/common/Icon";
import { DOMAIN_DEFAULTS } from "@/features/core/domain/constants/messages";
import type { CartItem } from "@/features/cart/domain/entities/Cart";
import { useCart } from "@/hooks/useCart";

interface CartDrawerViewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  total: number;
  title: string;
  emptyText: string;
  subtotalText: string;
  checkoutText: string;
  removeItemText: string;
  shopNowText: string;
  formatMoney: (value: number) => string;
  onUpdateQuantity: (itemId: number, quantity: number, variantId?: string) => void;
  onRemove: (itemId: number, variantId?: string) => void;
  onCheckout: () => void;
  onShopNow: () => void;
}

function CartDrawerView({
  isOpen,
  onOpenChange,
  items,
  total,
  title,
  emptyText,
  subtotalText,
  checkoutText,
  removeItemText,
  shopNowText,
  formatMoney,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  onShopNow,
}: CartDrawerViewProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-full w-full max-w-md flex-col p-0">
        <SheetHeader className="border-b px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">{title}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Icon name="x" className="w-6 h-6 text-foreground" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {items.length > 0 ? (
          <>
            <div className="flex-grow space-y-4 overflow-y-auto p-4 sm:p-6">
              {items.map((item) => {
                const variantId = JSON.stringify(item.selectedVariant);
                return (
                  <div key={`${item.id}-${variantId}`} className="flex gap-4">
                    <Image
                      src={item.imageUrl || "/placeholder.png"}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-md object-cover"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatMoney(item.price)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <QuantityInput
                          quantity={item.quantity}
                          setQuantity={(value) => onUpdateQuantity(item.id, value, variantId)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemove(item.id, variantId)}
                          className="h-10 w-10"
                          aria-label={removeItemText}
                        >
                          <Icon name="trash" className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto border-t p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between text-lg font-bold">
                <span>{subtotalText}</span>
                <span>{formatMoney(total)}</span>
              </div>
              <Button size="lg" className="w-full min-h-11" onClick={onCheckout}>
                {checkoutText}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-grow flex-col items-center justify-center p-6 text-center">
            <p className="text-muted-foreground">{emptyText}</p>
            <Button onClick={onShopNow} className="mt-4 min-h-11">
              {shopNowText}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export const CartDrawer: React.FC = () => {
  const { isCartOpen, toggleCart, cartItems, removeFromCart, updateQuantity, cartTotal } =
    useCart() as {
      isCartOpen: boolean;
      toggleCart: () => void;
      cartItems: CartItem[];
      removeFromCart: (itemId: number, variantId?: string) => void;
      updateQuantity: (itemId: number, quantity: number, variantId?: string) => void;
      cartTotal: number;
    };
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const formatMoney = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: DOMAIN_DEFAULTS.CURRENCY,
      minimumFractionDigits: 2,
    }).format(value);

  const onOpenChange = (open: boolean) => {
    if (!open && isCartOpen) {
      toggleCart();
    }
  };

  const handleCheckout = () => {
    toggleCart();
    router.push("/checkout");
  };

  const handleShopNow = () => {
    toggleCart();
    router.push("/shop");
  };

  return (
    <CartDrawerView
      isOpen={isCartOpen}
      onOpenChange={onOpenChange}
      items={cartItems}
      total={cartTotal}
      title={t("Pages.Cart.Title")}
      emptyText={t("Pages.Cart.Empty")}
      subtotalText={t("Pages.Cart.Subtotal")}
      checkoutText={t("Pages.Cart.Checkout")}
      removeItemText={t("Pages.Cart.RemoveItem")}
      shopNowText={t("Pages.Home.Hero.ButtonShop")}
      formatMoney={formatMoney}
      onUpdateQuantity={updateQuantity}
      onRemove={removeFromCart}
      onCheckout={handleCheckout}
      onShopNow={handleShopNow}
    />
  );
};
