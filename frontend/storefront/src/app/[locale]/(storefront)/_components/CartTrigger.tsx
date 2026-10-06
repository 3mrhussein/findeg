'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@findeg/ui';
import { IconTooltip } from '@findeg/ui';
import { useCart } from '@hooks/useCart';
import { useTranslations } from 'next-intl';

/**
 * Trigger button for the cart drawer with item count badge.
 * Shows the badge only for a positive count after hydration.
 * @throws {Error} If rendered outside a CartProvider.
 */
export function CartTrigger() {
  const { cartCount, setIsCartOpen } = useCart();
  const t = useTranslations();
  // Cart data can arrive before this streamed navigation hydrates. The first
  // render must match its server snapshot, which has no guest Cart badge.
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);

  return (
    <IconTooltip label={t('Layout.Header.CartButton')} asChild>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        aria-label={t('Layout.Header.CartButton')}
        data-testid="header-cart-trigger"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {hasHydrated && cartCount > 0 && (
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
