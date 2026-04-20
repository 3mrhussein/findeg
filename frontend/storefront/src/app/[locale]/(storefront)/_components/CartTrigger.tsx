"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@findeg/ui";
import { IconTooltip } from "@findeg/ui";
import { useCart } from "@hooks/useCart";
import { useTranslations } from "next-intl";

/**
 * Trigger button for the cart drawer with item count badge.
 */
export function CartTrigger() {
  const { cartCount, setIsCartOpen } = useCart();
  const t = useTranslations();

  return (
    <IconTooltip label={t("Layout.Header.CartButton")} asChild>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        aria-label={t("Layout.Header.CartButton")}
        data-testid="header-cart-trigger"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span
            className="absolute -top-2 -end-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            aria-hidden="true"
          >
            {cartCount}
          </span>
        )}
      </Button>
    </IconTooltip>
  );
}
