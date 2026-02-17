"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageStateEmpty } from "@/components/common/state/PageStateEmpty";

interface CheckoutLineItem {
  id: number;
  name: string;
  quantity: number;
  totalLabel: string;
}

interface CheckoutContentViewProps {
  isCartEmpty: boolean;
  lineItems: CheckoutLineItem[];
  cartTotalLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel: string;
  pageTitle: string;
  shippingInfoTitle: string;
  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  emailPlaceholder: string;
  addressPlaceholder: string;
  cityPlaceholder: string;
  postalCodePlaceholder: string;
  continuePaymentLabel: string;
  orderSummaryTitle: string;
  totalLabel: string;
  placeOrderLabel: string;
}

/**
 * Pure UI view for checkout content page.
 */
export function CheckoutContentView({
  isCartEmpty,
  lineItems,
  cartTotalLabel,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  pageTitle,
  shippingInfoTitle,
  firstNamePlaceholder,
  lastNamePlaceholder,
  emailPlaceholder,
  addressPlaceholder,
  cityPlaceholder,
  postalCodePlaceholder,
  continuePaymentLabel,
  orderSummaryTitle,
  totalLabel,
  placeOrderLabel,
}: CheckoutContentViewProps) {
  if (isCartEmpty) {
    return (
      <Container className="py-20">
        <PageStateEmpty
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          actionHref="/shop"
          iconName="shoppingCart"
        />
      </Container>
    );
  }

  return (
    <div className="bg-muted">
      <Container className="py-8 lg:py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 lg:mb-10">{pageTitle}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{shippingInfoTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input type="text" placeholder={firstNamePlaceholder} className="min-h-11" />
                <Input type="text" placeholder={lastNamePlaceholder} className="min-h-11" />
                <Input
                  type="email"
                  placeholder={emailPlaceholder}
                  className="sm:col-span-2 min-h-11"
                />
                <Input
                  type="text"
                  placeholder={addressPlaceholder}
                  className="sm:col-span-2 min-h-11"
                />
                <Input type="text" placeholder={cityPlaceholder} className="min-h-11" />
                <Input type="text" placeholder={postalCodePlaceholder} className="min-h-11" />
                <div className="sm:col-span-2">
                  <Button size="lg" className="w-full min-h-11">
                    {continuePaymentLabel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="h-fit lg:sticky lg:top-28">
            <CardHeader>
              <CardTitle>{orderSummaryTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">{item.totalLabel}</span>
                  </div>
                ))}
              </div>
              <div className="border-t my-6"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>{totalLabel}</span>
                <span>{cartTotalLabel}</span>
              </div>
              <Button size="lg" className="w-full mt-6 min-h-11">
                {placeOrderLabel}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
