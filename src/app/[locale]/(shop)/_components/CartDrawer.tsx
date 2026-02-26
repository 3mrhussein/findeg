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
      <SheetContent className="w-full sm:max-w-md flex flex-col" data-testid="cart-drawer-content">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {t("Pages.Cart.Title")} ({cartCount})
          </SheetTitle>
          <SheetDescription>{t("Pages.Cart.DrawerDescription")}</SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="flex-1 -mx-6 px-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-2">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p>{t("Pages.Cart.Empty")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const variantId = JSON.stringify({
                  variantKey: item.variantKey,
                  uomCode: item.uomCode,
                  customerGroup: item.customerGroup,
                });

                return (
                  <div
                    key={`${item.id}-${variantId}`}
                    className="flex gap-4"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="relative w-20 h-20 bg-secondary/10 rounded-md overflow-hidden shrink-0">
                      <Image
                        src={item.images?.[0] || "/placeholder-product.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.NumberFormat("en-EG", {
                            style: "currency",
                            currency: "EGP",
                          }).format(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, item.quantity - 1), variantId)
                            }
                            disabled={item.quantity <= 1}
                            aria-label={t("Pages.Cart.DecreaseQuantity")}
                            data-testid={`cart-decrease-${item.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span
                            className="w-8 text-center text-sm"
                            aria-live="polite"
                            data-testid={`cart-quantity-${item.id}`}
                          >
                            {item.quantity}
                          </span>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, variantId)}
                            aria-label={t("Pages.Cart.IncreaseQuantity")}
                            data-testid={`cart-increase-${item.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id, variantId)}
                          aria-label={t("Pages.Cart.RemoveItem")}
                          data-testid={`cart-remove-${item.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex justify-between font-bold text-lg">
            <span>{t("Pages.Checkout.Total")}</span>
            <span>
              {new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" }).format(
                cartTotal,
              )}
            </span>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Link href="/checkout" className="w-full">
                <Button className="w-full h-12 text-lg">{t("Pages.Cart.Checkout")}</Button>
              </Link>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
