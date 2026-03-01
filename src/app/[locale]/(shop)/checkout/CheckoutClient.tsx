"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { SectionStateEmpty } from "@/components/shared/state/SectionStateEmpty";
import {
  useCheckoutForm,
  type CheckoutValidationError,
} from "@/features/order/presentation/hooks/useCheckoutForm";
import type { CheckoutPrefillData } from "@/features/order/application/queries/checkout-prefill";

import { ShippingForm } from "./_components/ShippingForm";
import { PaymentForm } from "./_components/PaymentForm";
import { OrderSummary } from "./_components/OrderSummary";
import { CheckCircle2 } from "lucide-react";

interface CheckoutTotals {
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
}

interface PlaceOrderResult {
  success: boolean;
  orderId?: number;
  message?: string;
}

interface CheckoutClientProps {
  initialPrefill?: CheckoutPrefillData | null;
}

/**
 *
 */
function getGuestId() {
  const storageKey = "findeg_guest_id";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const generated = `guest_${crypto.randomUUID()}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

/**
 *
 */
export function CheckoutClient({ initialPrefill }: CheckoutClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<PlaceOrderResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formValues,
    paymentMethod,
    setPaymentMethod,
    canSubmit,
    setField,
    touchField,
    revealAllErrors,
    getFieldError,
  } = useCheckoutForm({ cartItemsCount: cartItems.length, initialValues: initialPrefill });

  const optimisticShipping = paymentMethod === "cod" ? 50 : 30;
  const optimisticTotal = cartTotal + optimisticShipping;
  const [validatedTotals, setValidatedTotals] = useState<CheckoutTotals | null>(null);

  const orderSummary = validatedTotals || {
    subtotal: cartTotal,
    shippingCost: optimisticShipping,
    total: optimisticTotal,
    currency: "EGP",
  };

  /**
   *
   */
  function toFieldErrorMessage(error: CheckoutValidationError | null) {
    if (!error) return null;
    switch (error) {
      case "fullName_required":
        return t("Pages.Checkout.ErrorFullName");
      case "email_invalid":
        return t("Pages.Checkout.ErrorEmail");
      case "phone_invalid":
        return t("Pages.Checkout.ErrorPhone");
      case "city_required":
        return t("Pages.Checkout.ErrorCity");
      case "area_required":
        return t("Pages.Checkout.ErrorArea");
      case "street_required":
        return t("Pages.Checkout.ErrorStreet");
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
    setOrderResult(null);
    setIsSubmitting(true);

    try {
      const guestId = getGuestId();

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

      const validateResponse = await fetch("/api/v1/checkout/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Id": guestId,
        },
        body: JSON.stringify({ address, paymentMethod }),
      });
      const validateJson = await validateResponse.json();

      if (!validateResponse.ok || !validateJson?.success) {
        throw new Error(validateJson?.error?.message || t("Pages.Checkout.ValidationFailed"));
      }

      setValidatedTotals(validateJson.data.totals);

      const orderResponse = await fetch("/api/v1/checkout/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Guest-Id": guestId,
        },
        body: JSON.stringify({
          address,
          paymentMethod,
          guestEmail: formValues.guestEmail.trim(),
        }),
      });
      const orderJson = await orderResponse.json();

      if (!orderResponse.ok || !orderJson?.success) {
        throw new Error(orderJson?.error?.message || t("Pages.Checkout.OrderCreationFailed"));
      }

      const orderId = orderJson?.data?.order?.id;
      setOrderResult({
        success: true,
        orderId,
        message: orderJson?.data?.message || t("Pages.Checkout.OrderCreatedSuccessfully"),
      });
      clearCart();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("Pages.Checkout.FailedToPlaceOrder");
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
        {/* Header */}
        <div className="mb-10 text-center">
          <h1
            id="checkout-title"
            className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4"
          >
            {t("Pages.Checkout.Title") || "Secure Checkout"}
          </h1>
          {!orderResult?.success && cartItems.length > 0 && (
            <p className="text-lg text-slate-500 max-w-lg mx-auto">
              You're almost there! Complete your details below to finalize your order.
            </p>
          )}
        </div>

        {cartItems.length === 0 && !orderResult?.success ? (
          <SectionStateEmpty
            title={t("Pages.Cart.Empty")}
            description={t("Pages.Checkout.EmptyDescription")}
            ctaLabel={t("Pages.Checkout.ContinueShopping")}
            ctaHref="/shop"
          />
        ) : null}

        {orderResult?.success ? (
          <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark p-8 md:p-12 text-center shadow-lg">
            <div className="size-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              {t("Pages.Checkout.OrderConfirmed")}
            </h2>
            <p aria-live="polite" className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
              {orderResult.message}
            </p>
            {orderResult.orderId ? (
              <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white font-mono font-medium mb-10">
                <span className="text-slate-500 font-sans text-sm">Order ID:</span> #
                {orderResult.orderId}
              </div>
            ) : null}
            <div>
              <Button
                onClick={() => router.push("/shop")}
                size="lg"
                className="rounded-full px-8 h-12 text-base shadow-sm"
              >
                {t("Pages.Checkout.ContinueShopping")}
              </Button>
            </div>
          </div>
        ) : cartItems.length > 0 ? (
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
                    {t("Pages.Checkout.ShippingInformation")}
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
                    {t("Pages.Checkout.PaymentMethod")}
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

              {errorMessage ? (
                <div
                  className="rounded-xl border border-destructive bg-destructive/10 p-4 text-destructive font-medium flex items-start gap-3"
                  role="alert"
                  aria-live="assertive"
                >
                  <span className="material-symbols-outlined mt-0.5">error</span>
                  <p>{errorMessage}</p>
                </div>
              ) : null}

              <Button
                size="lg"
                className="w-full text-lg h-16 rounded-full shadow-xl shadow-primary/25 hover:scale-[1.02] transition-transform"
                disabled={!canSubmit || isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="size-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {t("Pages.Checkout.PlacingOrder")}
                  </span>
                ) : (
                  t("Pages.Checkout.PlaceOrder")
                )}
              </Button>
            </form>

            <div className="lg:col-span-1 order-1 lg:order-2">
              <OrderSummary orderSummary={orderSummary} cartItemsCount={cartItems.length} t={t} />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
