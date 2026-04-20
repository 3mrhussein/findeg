"use client";

import { useState } from "react";
import { useCart } from "@hooks/useCart";
import { Button } from "@findeg/ui";
import { useTranslations } from "next-intl";
import { SectionStateEmpty } from "@components/shared/state/SectionStateEmpty";
import { useCheckoutForm, type CheckoutValidationError } from "./useCheckoutForm";
import { ShippingForm } from "../_components/ShippingForm";
import { PaymentForm } from "../_components/PaymentForm";
import { OrderSummary } from "../_components/OrderSummary";
import type {
  CheckoutClientProps,
  CheckoutTotals,
  PlaceOrderResult,
} from "./CheckoutClient.interface";
import { getGuestId } from "./CheckoutClient.interface";
import { OrderConfirmation } from "./OrderConfirmation";

/**
 * CheckoutClient — multi-step checkout wizard: shipping → payment → confirmation.
 */
export function CheckoutClient({ initialPrefill }: CheckoutClientProps) {
  const t = useTranslations();
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
  } = useCheckoutForm({
    cartItemsCount: cartItems.length,
    initialValues: initialPrefill || undefined,
  });

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
        headers: { "Content-Type": "application/json", "X-Guest-Id": guestId },
        body: JSON.stringify({ address, paymentMethod }),
      });
      const validateJson = await validateResponse.json();
      if (!validateResponse.ok || !validateJson?.success) {
        throw new Error(validateJson?.error?.message || t("Pages.Checkout.ValidationFailed"));
      }
      setValidatedTotals(validateJson.data.totals);
      const orderResponse = await fetch("/api/v1/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Guest-Id": guestId },
        body: JSON.stringify({ address, paymentMethod, guestEmail: formValues.guestEmail.trim() }),
      });
      const orderJson = await orderResponse.json();
      if (!orderResponse.ok || !orderJson?.success) {
        throw new Error(orderJson?.error?.message || t("Pages.Checkout.OrderCreationFailed"));
      }
      setOrderResult({
        success: true,
        orderId: orderJson?.data?.order?.id,
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
        <div className="mb-10 text-center">
          <h1
            id="checkout-title"
            className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4"
          >
            {t("Pages.Checkout.Title") || "Secure Checkout"}
          </h1>
          {!orderResult?.success && cartItems.length > 0 && (
            <p className="text-lg text-slate-500 max-w-lg mx-auto">
              You&apos;re almost there! Complete your details below to finalize your order.
            </p>
          )}
        </div>

        {cartItems.length === 0 && !orderResult?.success && (
          <SectionStateEmpty
            title={t("Pages.Cart.Empty")}
            description={t("Pages.Checkout.EmptyDescription")}
            ctaLabel={t("Pages.Checkout.ContinueShopping")}
            ctaHref="/shop"
          />
        )}

        {orderResult?.success ? (
          <OrderConfirmation
            result={orderResult}
            continueLabel={t("Pages.Checkout.ContinueShopping")}
            confirmTitle={t("Pages.Checkout.OrderConfirmed")}
          />
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
