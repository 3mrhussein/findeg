"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useCheckoutContentController } from "./useCheckoutContentController";
import { CheckoutContentView } from "./CheckoutContentView";

/**
 *
 */
export const CheckoutContent: React.FC = () => {
  const t = useTranslations();
  const { isCartEmpty, lineItems, cartTotalLabel } = useCheckoutContentController();

  return (
    <CheckoutContentView
      isCartEmpty={isCartEmpty}
      lineItems={lineItems}
      cartTotalLabel={cartTotalLabel}
      emptyTitle={t("Pages.Cart.Empty")}
      emptyDescription={t("Pages.Checkout.EmptyDescription")}
      emptyActionLabel={t("Pages.Home.Hero.ButtonShop")}
      pageTitle={t("Pages.Checkout.Title")}
      shippingInfoTitle={t("Pages.Checkout.ShippingInfo")}
      firstNamePlaceholder={t("Pages.Checkout.FirstName")}
      lastNamePlaceholder={t("Pages.Checkout.LastName")}
      emailPlaceholder={t("Pages.Checkout.Email")}
      addressPlaceholder={t("Pages.Checkout.Address")}
      cityPlaceholder={t("Pages.Checkout.City")}
      postalCodePlaceholder={t("Pages.Checkout.PostalCode")}
      continuePaymentLabel={t("Pages.Checkout.ContinuePayment")}
      orderSummaryTitle={t("Pages.Checkout.OrderSummary")}
      totalLabel={t("Pages.Checkout.Total")}
      placeOrderLabel={t("Pages.Checkout.PlaceOrder")}
    />
  );
};
