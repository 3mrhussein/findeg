'use client';

import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@findeg/ui';
import { IconTooltip } from '@findeg/ui';
import { useTranslations } from 'next-intl';
import { cn } from '@lib/utils';

interface CartItemProps {
  variantId: number;
  productName: string;
  variantLabel: string;
  uomCode: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  cartKitId?: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

const egpFormatter = new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' });

/**
 * Single cart item row — product image, name, variant, price, qty stepper, remove.
 */
export function CartItem({
  variantId,
  productName,
  variantLabel,
  uomCode,
  unitPrice,
  quantity,
  imageUrl,
  cartKitId,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const t = useTranslations();

  return (
    <div className="flex gap-5 group" data-testid={`cart-item-${variantId}`}>
      <div className="relative w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800/50">
        <Image
          src={imageUrl || '/images/placeholder.webp'}
          alt={productName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug">
              {productName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
              {variantLabel} {uomCode !== 'pcs' ? `(${uomCode})` : ''}
            </p>
          </div>
          <p className="font-bold text-primary whitespace-nowrap">
            {egpFormatter.format(unitPrice)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4">
          <div
            className={cn(
              'flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700/50 p-0.5',
              cartKitId && 'opacity-50 pointer-events-none',
            )}
          >
            <IconTooltip label={t('Pages.Cart.DecreaseQuantity')} asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={onDecrease}
                disabled={quantity <= 1 || !!cartKitId}
                aria-label={t('Pages.Cart.DecreaseQuantity')}
                data-testid={`cart-decrease-${variantId}`}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </IconTooltip>
            <span
              className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white"
              aria-live="polite"
              data-testid={`cart-quantity-${variantId}`}
            >
              {quantity}
            </span>
            <IconTooltip label={t('Pages.Cart.IncreaseQuantity')} asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={onIncrease}
                disabled={!!cartKitId}
                aria-label={t('Pages.Cart.IncreaseQuantity')}
                data-testid={`cart-increase-${variantId}`}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </IconTooltip>
          </div>

          <Button
            variant="ghost"
            className={cn(
              'h-auto p-0 text-xs font-semibold hover:bg-transparent transition-colors uppercase tracking-wider',
              cartKitId
                ? 'text-primary hover:text-primary/80'
                : 'text-slate-400 hover:text-destructive dark:hover:text-red-400',
            )}
            onClick={() => {
              if (cartKitId) {
                // Navigate to edit list or show kit removal?
                console.log('Edit kit', cartKitId);
              } else {
                onRemove();
              }
            }}
            aria-label={cartKitId ? 'Edit Kit' : t('Pages.Cart.RemoveItem')}
            data-testid={`cart-action-${variantId}`}
          >
            {cartKitId ? 'Edit List' : 'Remove'}
          </Button>
        </div>
      </div>
    </div>
  );
}
