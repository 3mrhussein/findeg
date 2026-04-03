"use client";

import { Separator } from "@/components/ui/separator";

interface OrderTotalsProps {
  order: any;
}

/**
 *
 */
export function OrderTotals({ order }: OrderTotalsProps) {
  const currency = order.currency || "EGP";
  const subtotal = Number(order.subtotal || 0);
  const shippingTotal = Number(order.shippingTotal || 0);
  const discountTotal = Number(order.discountTotal || 0);
  const totalAmount = Number(order.totalAmount || 0);

  return (
    <div className="flex justify-end">
      <div className="w-full max-w-xs space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>
            {currency} {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {currency} {shippingTotal.toFixed(2)}
          </span>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between text-sm text-destructive">
            <span>Discount</span>
            <span>
              -{currency} {discountTotal.toFixed(2)}
            </span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">
            {currency} {totalAmount.toFixed(2)}
          </span>
        </div>

        {order.paymentMethod && (
          <div className="pt-2 text-right">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Paid via {order.paymentMethod.replace("_", " ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
