'use client';

import type { CartItem } from '@findeg/backend/features/cart';
import type {
  CheckoutAcceptFailure,
  CheckoutQuote,
  CheckoutQuoteLine,
} from '@findeg/backend/features/checkout';
import { Button } from '@findeg/ui';

export type AcceptanceFailure =
  | { kind: 'reconfirmation-required'; previousQuote: CheckoutQuote; quote: CheckoutQuote }
  | {
      kind: 'insufficient-stock';
      shortfalls: NonNullable<CheckoutAcceptFailure['error']['shortfalls']>;
    };

interface AcceptanceFailureNoticeProps {
  failure: AcceptanceFailure;
  cartItems: CartItem[];
  isSubmitting: boolean;
  onConfirm: () => void;
  t: ReturnType<typeof import('next-intl').useTranslations>;
}

function money(currency: string, amount: number) {
  return `${currency} ${amount.toFixed(2)}`;
}

function discountsSignature(line: CheckoutQuoteLine | undefined) {
  return JSON.stringify(line?.discounts ?? []);
}

function formatDiscounts(line: CheckoutQuoteLine | undefined, currency: string, none: string) {
  if (!line?.discounts.length) return none;
  return line.discounts
    .map((discount) => `${discount.source}: ${money(currency, discount.amount)}`)
    .join(', ');
}

function ValueChange({
  label,
  previous,
  current,
}: {
  label: string;
  previous: string;
  current: string;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-2 text-sm">
      <dt className="font-medium">{label}</dt>
      <dd>
        {previous} → {current}
      </dd>
    </div>
  );
}

/** Shows actionable details for the expected Order Acceptance failures. */
export function AcceptanceFailureNotice({
  failure,
  cartItems,
  isSubmitting,
  onConfirm,
  t,
}: AcceptanceFailureNoticeProps) {
  const cartItemsByVariantId = new Map(
    cartItems.map((item) => [Number(item.variantId), item] as const),
  );

  if (failure.kind === 'insufficient-stock') {
    return (
      <section
        className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5"
        aria-labelledby="insufficient-stock-title"
      >
        <h2 id="insufficient-stock-title" className="text-lg font-bold text-destructive">
          {t('Pages.Checkout.InsufficientStockTitle')}
        </h2>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
          {t('Pages.Checkout.InsufficientStockDescription')}
        </p>
        <ul className="mt-4 space-y-2">
          {failure.shortfalls.map((shortfall) => {
            const item = cartItemsByVariantId.get(shortfall.variantId);
            return (
              <li
                key={shortfall.variantId}
                className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/60"
              >
                <span className="block font-semibold">
                  {item?.productName || t('Pages.Checkout.ItemFallback')}
                </span>
                {item?.variantLabel && <span className="block text-sm">{item.variantLabel}</span>}
                <span className="text-sm">
                  {t('Pages.Checkout.AvailableQuantity')}: {shortfall.available}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  const { previousQuote, quote } = failure;
  const currency = quote.currency;
  const previousLines = new Map(previousQuote.lines.map((line) => [line.variantId, line]));
  const currentLines = new Map(quote.lines.map((line) => [line.variantId, line]));
  const variantIds = new Set([...previousLines.keys(), ...currentLines.keys()]);
  const changedVariantIds = [...variantIds].filter((variantId) => {
    const previous = previousLines.get(variantId);
    const current = currentLines.get(variantId);
    return (
      !previous ||
      !current ||
      previous.quantity !== current.quantity ||
      previous.unitPrice !== current.unitPrice ||
      previous.lineTotal !== current.lineTotal ||
      discountsSignature(previous) !== discountsSignature(current)
    );
  });

  return (
    <section
      className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"
      aria-labelledby="reconfirmation-title"
    >
      <h2 id="reconfirmation-title" className="text-lg font-bold">
        {t('Pages.Checkout.ReconfirmationTitle')}
      </h2>
      <p className="mt-1 text-sm">{t('Pages.Checkout.ReconfirmationDescription')}</p>
      <ul className="mt-4 space-y-2">
        {changedVariantIds.map((variantId) => {
          const previous = previousLines.get(variantId);
          const current = currentLines.get(variantId);
          const item = cartItemsByVariantId.get(variantId);
          return (
            <li key={variantId} className="rounded-xl bg-white/70 p-3">
              <span className="block font-semibold">
                {item?.productName || t('Pages.Checkout.ItemFallback')}
              </span>
              {item?.variantLabel && <span className="block text-sm">{item.variantLabel}</span>}
              {!previous || !current ? (
                <p className="mt-2 text-sm">
                  {!previous
                    ? t('Pages.Checkout.QuoteItemAdded')
                    : t('Pages.Checkout.QuoteItemRemoved')}
                </p>
              ) : (
                <dl className="mt-2 space-y-1">
                  {previous.quantity !== current.quantity && (
                    <ValueChange
                      label={t('Pages.Checkout.Quantity')}
                      previous={String(previous.quantity)}
                      current={String(current.quantity)}
                    />
                  )}
                  {previous.unitPrice !== current.unitPrice && (
                    <ValueChange
                      label={t('Pages.Checkout.UnitPrice')}
                      previous={money(currency, previous.unitPrice)}
                      current={money(currency, current.unitPrice)}
                    />
                  )}
                  {discountsSignature(previous) !== discountsSignature(current) && (
                    <ValueChange
                      label={t('Pages.Checkout.Discounts')}
                      previous={formatDiscounts(previous, currency, t('Pages.Checkout.NoDiscount'))}
                      current={formatDiscounts(current, currency, t('Pages.Checkout.NoDiscount'))}
                    />
                  )}
                  {previous.lineTotal !== current.lineTotal && (
                    <ValueChange
                      label={t('Pages.Checkout.LineTotal')}
                      previous={money(currency, previous.lineTotal)}
                      current={money(currency, current.lineTotal)}
                    />
                  )}
                </dl>
              )}
            </li>
          );
        })}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-amber-200 pt-4">
        {previousQuote.subtotal !== quote.subtotal && (
          <ValueChange
            label={t('Pages.Checkout.Subtotal')}
            previous={money(currency, previousQuote.subtotal)}
            current={money(currency, quote.subtotal)}
          />
        )}
        {previousQuote.shipping !== quote.shipping && (
          <ValueChange
            label={t('Pages.Checkout.Shipping')}
            previous={money(currency, previousQuote.shipping)}
            current={money(currency, quote.shipping)}
          />
        )}
        <ValueChange
          label={t('Pages.Checkout.UpdatedQuoteTotal')}
          previous={money(currency, previousQuote.total)}
          current={money(currency, quote.total)}
        />
      </dl>
      <Button type="button" className="mt-4 w-full" disabled={isSubmitting} onClick={onConfirm}>
        {t('Pages.Checkout.ConfirmUpdatedQuote')}
      </Button>
    </section>
  );
}
