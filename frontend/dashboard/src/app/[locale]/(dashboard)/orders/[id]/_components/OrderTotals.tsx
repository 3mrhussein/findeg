'use client';

import { addMoney, money } from '@findeg/domain';
import { Separator } from '@findeg/ui';
import { formatEgp } from '@findeg/ui';

interface OrderTotalsProps {
  order: import('@findeg/orders').Order;
}

/**
 *
 */
export function OrderTotals({ order }: OrderTotalsProps) {
  const currency = order.currency || 'EGP';
  const subtotal = addMoney(money(order.subtotal), money(order.discountTotal));
  const shippingTotal = order.shippingCost;
  const discountTotal = order.discountTotal;
  const totalAmount = order.totalAmount;

  return (
    <div className="flex justify-end">
      <div className="w-full max-w-xs space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>
            {currency} {formatEgp(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {currency} {formatEgp(shippingTotal)}
          </span>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between text-sm text-destructive">
            <span>Discount</span>
            <span>
              -{currency} {formatEgp(discountTotal)}
            </span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">
            {currency} {formatEgp(totalAmount)}
          </span>
        </div>

        {order.paymentMethod && (
          <div className="pt-2 text-right">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Paid via {order.paymentMethod.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
