"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { SectionStateEmpty } from "@/components/common/state/SectionStateEmpty";
import {
  useCheckoutForm,
  type CheckoutValidationError,
  type PaymentMethod,
} from "@/features/order/presentation/hooks/useCheckoutForm";
import type { CheckoutPrefillData } from "@/features/order/application/queries/checkout-prefill";

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
    <main className="bg-background py-8 lg:py-12" aria-labelledby="checkout-title">
      <Container>
        <h1 id="checkout-title" className="text-3xl font-bold mb-8">
          {t("Pages.Checkout.Title")}
        </h1>

        {cartItems.length === 0 && !orderResult?.success ? (
          <SectionStateEmpty
            title={t("Pages.Cart.Empty")}
            description={t("Pages.Checkout.EmptyDescription")}
            ctaLabel={t("Pages.Checkout.ContinueShopping")}
            ctaHref="/"
          />
        ) : null}

        {orderResult?.success ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("Pages.Checkout.OrderConfirmed")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p aria-live="polite">{orderResult.message}</p>
              {orderResult.orderId ? (
                <p>{t("Pages.Checkout.OrderId", { id: orderResult.orderId })}</p>
              ) : null}
              <Button onClick={() => router.push("/")}>
                {t("Pages.Checkout.ContinueShopping")}
              </Button>
            </CardContent>
          </Card>
        ) : cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form
              className="lg:col-span-2 space-y-6 order-2 lg:order-1"
              onSubmit={handlePlaceOrder}
              noValidate
              aria-busy={isSubmitting}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t("Pages.Checkout.ShippingInformation")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("Pages.Checkout.FullName")}</Label>
                    <Input
                      id="fullName"
                      placeholder={t("Pages.Checkout.PlaceholderFullName")}
                      value={formValues.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      onBlur={() => touchField("fullName")}
                      autoComplete="name"
                      required
                    />
                    {toFieldErrorMessage(getFieldError("fullName")) ? (
                      <p className="text-xs text-destructive">
                        {toFieldErrorMessage(getFieldError("fullName"))}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("Pages.Checkout.EmailRequired")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("Pages.Checkout.PlaceholderEmail")}
                      value={formValues.guestEmail}
                      onChange={(e) => setField("guestEmail", e.target.value)}
                      onBlur={() => touchField("guestEmail")}
                      autoComplete="email"
                      required
                    />
                    {toFieldErrorMessage(getFieldError("guestEmail")) ? (
                      <p className="text-xs text-destructive">
                        {toFieldErrorMessage(getFieldError("guestEmail"))}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("Pages.Checkout.Phone")}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t("Pages.Checkout.PlaceholderPhone")}
                        value={formValues.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        onBlur={() => touchField("phone")}
                        autoComplete="tel"
                        inputMode="numeric"
                        pattern="[0-9+\\-\\s]{11,}"
                        minLength={11}
                        required
                      />
                      {toFieldErrorMessage(getFieldError("phone")) ? (
                        <p className="text-xs text-destructive">
                          {toFieldErrorMessage(getFieldError("phone"))}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t("Pages.Checkout.City")}</Label>
                      <Input
                        id="city"
                        placeholder={t("Pages.Checkout.PlaceholderCity")}
                        value={formValues.city}
                        onChange={(e) => setField("city", e.target.value)}
                        onBlur={() => touchField("city")}
                        autoComplete="address-level2"
                        required
                      />
                      {toFieldErrorMessage(getFieldError("city")) ? (
                        <p className="text-xs text-destructive">
                          {toFieldErrorMessage(getFieldError("city"))}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">{t("Pages.Checkout.Area")}</Label>
                      <Input
                        id="area"
                        placeholder={t("Pages.Checkout.PlaceholderArea")}
                        value={formValues.area}
                        onChange={(e) => setField("area", e.target.value)}
                        onBlur={() => touchField("area")}
                        autoComplete="address-level1"
                        required
                      />
                      {toFieldErrorMessage(getFieldError("area")) ? (
                        <p className="text-xs text-destructive">
                          {toFieldErrorMessage(getFieldError("area"))}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street">{t("Pages.Checkout.Street")}</Label>
                      <Input
                        id="street"
                        placeholder={t("Pages.Checkout.PlaceholderStreet")}
                        value={formValues.street}
                        onChange={(e) => setField("street", e.target.value)}
                        onBlur={() => touchField("street")}
                        autoComplete="street-address"
                        required
                      />
                      {toFieldErrorMessage(getFieldError("street")) ? (
                        <p className="text-xs text-destructive">
                          {toFieldErrorMessage(getFieldError("street"))}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="building">{t("Pages.Checkout.BuildingOptional")}</Label>
                      <Input
                        id="building"
                        placeholder={t("Pages.Checkout.PlaceholderBuilding")}
                        value={formValues.building}
                        onChange={(e) => setField("building", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floor">{t("Pages.Checkout.FloorOptional")}</Label>
                      <Input
                        id="floor"
                        placeholder={t("Pages.Checkout.PlaceholderFloor")}
                        value={formValues.floor}
                        onChange={(e) => setField("floor", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartment">{t("Pages.Checkout.ApartmentOptional")}</Label>
                      <Input
                        id="apartment"
                        placeholder={t("Pages.Checkout.PlaceholderApartment")}
                        value={formValues.apartment}
                        onChange={(e) => setField("apartment", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{t("Pages.Checkout.DeliveryNotesOptional")}</Label>
                    <Input
                      id="notes"
                      placeholder={t("Pages.Checkout.PlaceholderNotes")}
                      value={formValues.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("Pages.Checkout.PaymentMethod")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <fieldset className="space-y-3">
                    <legend className="sr-only">{t("Pages.Checkout.PaymentMethod")}</legend>
                    <label
                      htmlFor="payment-cod"
                      className="flex items-center gap-3 rounded-md border p-3 cursor-pointer"
                    >
                      <input
                        id="payment-cod"
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        required
                      />
                      <span>{t("Pages.Checkout.CashOnDelivery")}</span>
                    </label>
                    <label
                      htmlFor="payment-card"
                      className="flex items-center gap-3 rounded-md border p-3 cursor-pointer"
                    >
                      <input
                        id="payment-card"
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        required
                      />
                      <span>{t("Pages.Checkout.CardPayment")}</span>
                    </label>
                  </fieldset>
                </CardContent>
              </Card>

              {errorMessage ? (
                <Card className="border-destructive" role="alert" aria-live="assertive">
                  <CardContent className="pt-6 text-destructive">{errorMessage}</CardContent>
                </Card>
              ) : null}

              <Button
                size="lg"
                className="w-full text-lg h-14"
                disabled={!canSubmit || isSubmitting}
                type="submit"
              >
                {isSubmitting ? t("Pages.Checkout.PlacingOrder") : t("Pages.Checkout.PlaceOrder")}
              </Button>
            </form>

            <div className="lg:col-span-1 order-1 lg:order-2">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t("Pages.Checkout.OrderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Pages.Checkout.Items")}</span>
                    <span>{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Pages.Checkout.Subtotal")}</span>
                    <span>
                      {orderSummary.currency} {orderSummary.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Pages.Checkout.Shipping")}</span>
                    <span>
                      {orderSummary.currency} {orderSummary.shippingCost.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t("Pages.Checkout.Total")}</span>
                    <span>
                      {orderSummary.currency} {orderSummary.total.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </Container>
    </main>
  );
}
