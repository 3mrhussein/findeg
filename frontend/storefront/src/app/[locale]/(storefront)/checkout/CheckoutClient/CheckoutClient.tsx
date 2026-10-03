'use client';

import { useState, useRef, useEffect } from 'react';
import { useCart } from '@hooks/useCart';
import { Button } from '@findeg/ui';
import { useTranslations } from 'next-intl';
import type {
  CheckoutAcceptFailure,
  CheckoutOrderInput,
  CheckoutQuote,
  CheckoutReceipt,
} from '@findeg/backend/features/checkout';
import { SectionStateEmpty } from '@components/shared/state/SectionStateEmpty';
import { useCheckoutForm, type CheckoutValidationError } from './useCheckoutForm';
import { ShippingForm } from '../_components/ShippingForm';
import { PaymentForm } from '../_components/PaymentForm';
import { OrderSummary } from '../_components/OrderSummary';
import type {
  CheckoutClientProps,
  CheckoutTotals,
  PlaceOrderResult,
} from './CheckoutClient.interface';
import { getGuestId } from './CheckoutClient.interface';
import { OrderConfirmation } from './OrderConfirmation';
import { AcceptanceFailureNotice, type AcceptanceFailure } from './AcceptanceFailureNotice';
import {
  linesForPost,
  listCompleteness,
  loadSelection,
  resetSelection,
  seedSelection,
  type ListSelection,
} from '@/lib/list-selection/list-selection';

/** The order body as sent: the form still offers 'card', which the backend rejects until supported. */
type PendingOrderPayload = Omit<CheckoutOrderInput, 'paymentMethod'> & {
  paymentMethod: 'cod' | 'card';
};

interface PendingAttempt {
  signature: string;
  idempotencyKey: string;
  totals: CheckoutTotals;
  quote: CheckoutQuote;
  payload: PendingOrderPayload;
}

function toCheckoutTotals(quote: CheckoutQuote): CheckoutTotals {
  return {
    subtotal: quote.subtotal,
    shippingCost: quote.shipping,
    total: quote.total,
    currency: quote.currency,
  };
}

/**
 * CheckoutClient — multi-step checkout wizard: shipping → payment → confirmation.
 */
export function CheckoutClient({
  initialPrefill,
  checkoutSource = { source: 'cart' },
}: CheckoutClientProps) {
  const t = useTranslations();
  const { cartItems, cartTotal, clearCart } = useCart();
  const list = checkoutSource.source === 'list' ? checkoutSource.list : null;
  const sourceKey = list ? `list:${list.publicCode}` : 'cart';
  const [selection, setSelection] = useState<ListSelection | null>(() =>
    list ? seedSelection(list) : null,
  );
  const [hydratedListKey, setHydratedListKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<PlaceOrderResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [acceptanceFailure, setAcceptanceFailure] = useState<AcceptanceFailure | null>(null);
  const [validatedTotals, setValidatedTotals] = useState<CheckoutTotals | null>(null);
  const pendingAttemptsRef = useRef(new Map<string, PendingAttempt>());
  const selectedLines = list && selection ? linesForPost(selection) : [];
  const checkoutLines = list
    ? selectedLines
    : cartItems.map((item) => ({
        variantId: Number(item.variantId),
        quantity: item.quantity,
      }));
  const hasItems = checkoutLines.length > 0;
  const {
    formValues,
    paymentMethod,
    setPaymentMethod,
    canSubmit,
    setField,
    touchField,
    revealAllErrors,
    getFieldError,
  } = useCheckoutForm({
    cartItemsCount: checkoutLines.length,
    initialValues: initialPrefill || undefined,
  });

  // Reset attempt key and payload if checkout inputs change so modified orders get a fresh key.
  // Keyed on a content signature, not object identity: a cart refetch or re-render that yields
  // equal values must not discard the key mid-retry.
  const inputsSignature = JSON.stringify([sourceKey, formValues, checkoutLines, paymentMethod]);

  useEffect(() => {
    if (!list) {
      setSelection(null);
      setHydratedListKey(null);
      return;
    }
    setSelection(loadSelection(list, window.localStorage).selection);
    setHydratedListKey(sourceKey);
  }, [list, sourceKey]);

  useEffect(() => {
    // A list's persisted selection loads after the first render. Do not compare
    // against the transient selection left by another source and discard a
    // perfectly matching retry attempt before hydration finishes.
    if (list && hydratedListKey !== sourceKey) return;
    const attempt = pendingAttemptsRef.current.get(sourceKey);
    if (attempt && attempt.signature !== inputsSignature) {
      pendingAttemptsRef.current.delete(sourceKey);
      setValidatedTotals(null);
      setAcceptanceFailure(null);
      return;
    }
    setValidatedTotals(attempt?.totals ?? null);
    setAcceptanceFailure(null);
  }, [hydratedListKey, inputsSignature, list, sourceKey]);

  useEffect(() => {
    setOrderResult(null);
    setErrorMessage(null);
  }, [sourceKey]);

  /** Drops the pending attempt and the quote it produced, so the summary never shows stale totals. */
  function discardAttempt() {
    pendingAttemptsRef.current.delete(sourceKey);
    setValidatedTotals(null);
    setAcceptanceFailure(null);
  }

  const optimisticShipping = paymentMethod === 'cod' ? 50 : 30;
  const listTotal = list
    ? selectedLines.reduce((sum, line) => {
        const item = list.items.find((candidate) => candidate.id === line.listItemId);
        const variant = item?.eligibleVariants.find(
          (candidate) => candidate.variantId === line.variantId,
        );
        return sum + Number(variant?.price ?? 0) * line.quantity;
      }, 0)
    : cartTotal;
  const optimisticTotal = listTotal + optimisticShipping;
  const orderSummary = validatedTotals || {
    subtotal: listTotal,
    shippingCost: optimisticShipping,
    total: optimisticTotal,
    currency: 'EGP',
  };
  const acceptanceItems = list
    ? selectedLines.flatMap((line) => {
        const item = list.items.find((candidate) => candidate.id === line.listItemId);
        const variant =
          item?.eligibleVariants.find((candidate) => candidate.variantId === line.variantId) ??
          (item?.defaultVariant.variantId === line.variantId ? item.defaultVariant : undefined);
        if (!item) return [];
        return [
          {
            listItemId: line.listItemId,
            variantId: line.variantId,
            productName:
              variant?.name.en || variant?.name.ar || item.label.en || item.label.ar || '',
            variantLabel: variant?.variantLabel?.en || variant?.variantLabel?.ar || undefined,
          },
        ];
      })
    : cartItems.map((item) => ({
        variantId: Number(item.variantId),
        productName: item.productName,
        variantLabel: item.variantLabel || undefined,
      }));

  /**
   *
   */
  function toFieldErrorMessage(error: CheckoutValidationError | null) {
    if (!error) return null;
    switch (error) {
      case 'fullName_required':
        return t('Pages.Checkout.ErrorFullName');
      case 'email_invalid':
        return t('Pages.Checkout.ErrorEmail');
      case 'phone_invalid':
        return t('Pages.Checkout.ErrorPhone');
      case 'city_required':
        return t('Pages.Checkout.ErrorCity');
      case 'area_required':
        return t('Pages.Checkout.ErrorArea');
      case 'street_required':
        return t('Pages.Checkout.ErrorStreet');
      default:
        return null;
    }
  }

  /**
   *
   */
  async function handlePlaceOrder(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!canSubmit) {
      revealAllErrors();
      return;
    }
    setErrorMessage(null);
    setAcceptanceFailure(null);
    setOrderResult(null);
    setIsSubmitting(true);
    try {
      const guestId = getGuestId();
      let idempotencyKey: string;
      let orderPayload: PendingOrderPayload;

      const pendingAttempt = pendingAttemptsRef.current.get(sourceKey);
      if (pendingAttempt) {
        // Reuse original key and payload on retry so that matching replays return the stored order
        // even if price/quote changed in the meantime (per Issue #239).
        idempotencyKey = pendingAttempt.idempotencyKey;
        orderPayload = pendingAttempt.payload;
        setValidatedTotals(pendingAttempt.totals);
      } else {
        const address = {
          fullName: formValues.fullName.trim(),
          phone: formValues.phone.trim(),
          city: formValues.city.trim(),
          area: formValues.area.trim(),
          street: formValues.street.trim(),
          building: formValues.building.trim() || undefined,
          floor: formValues.floor.trim() || undefined,
          apartment: formValues.apartment.trim() || undefined,
          notes: formValues.notes.trim() || undefined,
        };
        const sourceInput = list
          ? { source: 'list' as const, publicCode: list.publicCode, lines: selectedLines }
          : { source: 'cart' as const, lines: checkoutLines };

        const validateResponse = await fetch('/api/v1/checkout/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Guest-Id': guestId },
          body: JSON.stringify({
            ...sourceInput,
            address,
            paymentMethod,
          }),
        });
        const validateJson = await validateResponse.json();
        if (!validateResponse.ok || !validateJson?.success) {
          throw new Error(validateJson?.error?.message || t('Pages.Checkout.ValidationFailed'));
        }
        const quote = validateJson.data;
        const totals = toCheckoutTotals(quote);
        setValidatedTotals(totals);

        idempotencyKey = crypto.randomUUID();
        orderPayload = {
          ...sourceInput,
          confirmation: quote.confirmation,
          address,
          paymentMethod,
          guestEmail: formValues.guestEmail.trim() || undefined,
        };

        pendingAttemptsRef.current.set(sourceKey, {
          signature: inputsSignature,
          idempotencyKey,
          totals,
          quote,
          payload: orderPayload,
        });
      }

      const orderResponse = await fetch('/api/v1/checkout/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Guest-Id': guestId,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(orderPayload),
      });
      const orderJson: {
        success?: boolean;
        data?: CheckoutReceipt;
        error?: CheckoutAcceptFailure['error'];
      } = await orderResponse.json();
      const receipt = orderJson.data;
      if (!orderResponse.ok || !orderJson?.success) {
        if (
          orderJson.error?.code === 'reconfirmation-required' &&
          orderJson.error.quote &&
          pendingAttemptsRef.current.get(sourceKey)
        ) {
          const previousQuote = pendingAttemptsRef.current.get(sourceKey)!.quote;
          const quote = orderJson.error.quote;
          const totals = toCheckoutTotals(quote);
          pendingAttemptsRef.current.set(sourceKey, {
            signature: inputsSignature,
            idempotencyKey: crypto.randomUUID(),
            totals,
            quote,
            payload: { ...orderPayload, confirmation: quote.confirmation },
          });
          setValidatedTotals(totals);
          setAcceptanceFailure({ kind: 'reconfirmation-required', previousQuote, quote });
          return;
        }
        if (orderJson.error?.code === 'insufficient-stock' && orderJson.error.shortfalls?.length) {
          pendingAttemptsRef.current.delete(sourceKey);
          setValidatedTotals(null);
          setAcceptanceFailure({
            kind: 'insufficient-stock',
            shortfalls: orderJson.error.shortfalls,
          });
          return;
        }
        // A definitive 4xx (conflict, stock, reconfirmation, validation) means nothing was committed,
        // so drop the attempt and re-validate with a fresh key on the next submit. 5xx, 408 and 429
        // leave the outcome unknown (or retryable), so keep the key and payload for a safe replay.
        const { status } = orderResponse;
        if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
          discardAttempt();
        }
        throw new Error(orderJson?.error?.message || t('Pages.Checkout.OrderCreationFailed'));
      }
      pendingAttemptsRef.current.delete(sourceKey);
      setOrderResult({
        success: true,
        orderId: receipt?.order.id,
        orderReference: receipt?.order.orderReference,
        message: receipt?.message || t('Pages.Checkout.OrderCreatedSuccessfully'),
      });
      if (list) {
        resetSelection(list.publicCode, window.localStorage);
        setSelection(seedSelection(list));
      } else {
        clearCart();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('Pages.Checkout.FailedToPlaceOrder');
      setErrorMessage(message);
      setOrderResult({ success: false, message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className="bg-slate-50 dark:bg-slate-900/30 min-h-screen py-10 lg:py-16"
      aria-labelledby="checkout-title"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1
            id="checkout-title"
            className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4"
          >
            {t('Pages.Checkout.Title') || 'Secure Checkout'}
          </h1>
          {!orderResult?.success && hasItems && (
            <p className="text-lg text-slate-500 max-w-lg mx-auto">
              You&apos;re almost there! Complete your details below to finalize your order.
            </p>
          )}
        </div>

        {!hasItems && !orderResult?.success && (
          <SectionStateEmpty
            title={t('Pages.Cart.Empty')}
            description={t('Pages.Checkout.EmptyDescription')}
            ctaLabel={t('Pages.Checkout.ContinueShopping')}
            ctaHref="/shop"
          />
        )}

        {orderResult?.success ? (
          <OrderConfirmation
            result={orderResult}
            continueLabel={t('Pages.Checkout.ContinueShopping')}
            confirmTitle={t('Pages.Checkout.OrderConfirmed')}
            orderReferenceLabel={t('Pages.Checkout.OrderReference')}
          />
        ) : hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            <form
              className="lg:col-span-2 space-y-10 order-2 lg:order-1"
              onSubmit={handlePlaceOrder}
              noValidate
              aria-busy={isSubmitting}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex size-8 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {t('Pages.Checkout.ShippingInformation')}
                  </h2>
                </div>
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark p-6 md:p-8 shadow-sm">
                  <ShippingForm
                    formValues={formValues}
                    setField={setField}
                    touchField={touchField}
                    toFieldErrorMessage={toFieldErrorMessage}
                    getFieldError={getFieldError}
                    t={t}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex size-8 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {t('Pages.Checkout.PaymentMethod')}
                  </h2>
                </div>
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark p-6 md:p-8 shadow-sm">
                  <PaymentForm
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    t={t}
                  />
                </div>
              </div>

              {errorMessage && (
                <div
                  className="rounded-xl border border-destructive bg-destructive/10 p-4 text-destructive font-medium flex items-start gap-3"
                  role="alert"
                  aria-live="assertive"
                >
                  <span className="material-symbols-outlined mt-0.5">error</span>
                  <p>{errorMessage}</p>
                </div>
              )}

              {acceptanceFailure && (
                <AcceptanceFailureNotice
                  failure={acceptanceFailure}
                  items={acceptanceItems}
                  isSubmitting={isSubmitting}
                  onConfirm={() => void handlePlaceOrder()}
                  t={t}
                />
              )}

              <Button
                size="lg"
                className="w-full text-lg h-16 rounded-full shadow-xl shadow-primary/25 hover:scale-[1.02] transition-transform"
                disabled={!canSubmit || isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="size-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {t('Pages.Checkout.PlacingOrder')}
                  </span>
                ) : (
                  t('Pages.Checkout.PlaceOrder')
                )}
              </Button>
            </form>
            <div className="lg:col-span-1 order-1 lg:order-2">
              <OrderSummary
                orderSummary={orderSummary}
                cartItemsCount={checkoutLines.length}
                listCompleteness={list && selection ? listCompleteness(list, selection) : undefined}
                t={t}
              />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
