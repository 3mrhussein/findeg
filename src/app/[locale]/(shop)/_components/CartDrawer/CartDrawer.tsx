"use client";

import { useCart } from "@/hooks/useCart";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartEmptyState } from "./CartEmptyState";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

/**
 * CartDrawer — slide-over sheet showing cart items with qty controls and checkout.
 */
export function CartDrawer() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        className="w-full sm:max-w-md flex flex-col bg-white/95 dark:bg-background/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800/50 p-0"
        data-testid="cart-drawer-content"
      >
        <SheetHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
          <SheetTitle className="flex items-center justify-between text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[28px] text-primary">
                shopping_bag
              </span>
              Your Cart
              <span className="flex items-center justify-center size-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">
                {cartCount}
              </span>
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Your shopping cart</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {cartItems.length === 0 ? (
            <CartEmptyState />
          ) : (
            <div className="space-y-6 py-6 border-b border-slate-100 dark:border-slate-800/50">
              {cartItems.map((item) => (
                <CartItem
                  key={`${item.variantId}-${item.uomCode}`}
                  variantId={item.variantId}
                  productName={item.productName}
                  variantLabel={item.variantLabel}
                  uomCode={item.uomCode}
                  unitPrice={item.unitPrice}
                  quantity={item.quantity}
                  imageUrl={item.imageUrl}
                  onIncrease={() => updateQuantity(item.variantId, item.uomCode, item.quantity + 1)}
                  onDecrease={() =>
                    updateQuantity(item.variantId, item.uomCode, Math.max(1, item.quantity - 1))
                  }
                  onRemove={() => removeFromCart(item.variantId, item.uomCode)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {cartItems.length > 0 && <CartSummary cartTotal={cartTotal} />}
      </SheetContent>
    </Sheet>
  );
}
