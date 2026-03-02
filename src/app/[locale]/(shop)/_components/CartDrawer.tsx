"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ShoppingBag, Plus, Minus, X } from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

/**
 *
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
  const t = useTranslations();

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
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
              <div className="flex size-24 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
                  shopping_cart
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Your cart is empty
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px] mx-auto">
                  Looks like you haven&apos;t added anything to your cart yet.
                </p>
              </div>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Continue Shopping
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-6 py-6 border-b border-slate-100 dark:border-slate-800/50">
              {cartItems.map((item) => (
                <div
                  key={`${item.variantId}-${item.uomCode}`}
                  className="flex gap-5 group"
                  data-testid={`cart-item-${item.variantId}`}
                >
                  <div className="relative w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800/50">
                    <Image
                      src={item.imageUrl || "/images/placeholder.webp"}
                      alt={item.productName}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug">
                          {item.productName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
                          {item.variantLabel} {item.uomCode !== "pcs" ? `(${item.uomCode})` : ""}
                        </p>
                      </div>
                      <p className="font-bold text-primary whitespace-nowrap">
                        {new Intl.NumberFormat("en-EG", {
                          style: "currency",
                          currency: "EGP",
                        }).format(item.unitPrice)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4">
                      <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700/50 p-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                          onClick={() =>
                            updateQuantity(
                              item.variantId,
                              item.uomCode,
                              Math.max(1, item.quantity - 1),
                            )
                          }
                          disabled={item.quantity <= 1}
                          aria-label={t("Pages.Cart.DecreaseQuantity")}
                          data-testid={`cart-decrease-${item.variantId}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <span
                          className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white"
                          aria-live="polite"
                          data-testid={`cart-quantity-${item.variantId}`}
                        >
                          {item.quantity}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                          onClick={() =>
                            updateQuantity(item.variantId, item.uomCode, item.quantity + 1)
                          }
                          aria-label={t("Pages.Cart.IncreaseQuantity")}
                          data-testid={`cart-increase-${item.variantId}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        className="h-auto p-0 text-xs font-semibold text-slate-400 hover:text-destructive dark:hover:text-red-400 hover:bg-transparent transition-colors uppercase tracking-wider"
                        onClick={() => removeFromCart(item.variantId, item.uomCode)}
                        aria-label={t("Pages.Cart.RemoveItem")}
                        data-testid={`cart-remove-${item.variantId}`}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cartItems.length > 0 && (
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" }).format(
                    cartTotal,
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Shipping</span>
                <span className="text-slate-900 dark:text-white">Calculated at checkout</span>
              </div>
              <Separator className="dark:bg-slate-800" />
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  {t("Pages.Checkout.Total")}
                </span>
                <span className="text-2xl font-black text-primary">
                  {new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" }).format(
                    cartTotal,
                  )}
                </span>
              </div>
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Link href="/checkout" className="w-full">
                  <Button className="w-full h-14 text-lg font-bold rounded-full shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {t("Pages.Cart.Checkout")}
                  </Button>
                </Link>
              </SheetClose>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
