import { addMoney, money } from '@findeg/domain';
import { formatEgp } from '@findeg/ui';
import type { Order } from '@findeg/orders';

/** Exact historical Customer totals. Acceptance stores subtotal after discounts. */
export function OrderSnapshotTotals({
  subtotal,
  discountTotal,
  shippingCost,
  totalAmount,
  currency,
  labels,
}: Pick<Order, 'subtotal' | 'discountTotal' | 'shippingCost' | 'totalAmount' | 'currency'> & {
  labels: { subtotal: string; discount: string; shipping: string; total: string };
}) {
  return (
    <dl className="space-y-2">
      <div className="flex justify-between">
        <dt>{labels.subtotal}</dt>
        <dd data-testid="order-gross-subtotal">
          {currency} {formatEgp(addMoney(money(subtotal), money(discountTotal)))}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt>{labels.discount}</dt>
        <dd data-testid="order-discount-total">
          {currency} {formatEgp(money(discountTotal))}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt>{labels.shipping}</dt>
        <dd>
          {currency} {formatEgp(money(shippingCost))}
        </dd>
      </div>
      <div className="flex justify-between font-semibold">
        <dt>{labels.total}</dt>
        <dd data-testid="order-total">
          {currency} {formatEgp(money(totalAmount))}
        </dd>
      </div>
    </dl>
  );
}
