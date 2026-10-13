'use client';

import { useTranslations } from 'next-intl';
import { formatEgp } from '@findeg/ui';
import { Badge } from '@findeg/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@findeg/ui';

interface OrderItemsTableProps {
  items: import('@findeg/orders').OrderItem[];
  currency: string;
}

/**
 *
 */
export function OrderItemsTable({ items, currency }: OrderItemsTableProps) {
  const t = useTranslations('Administration.OrdersDetail');
  return (
    <div className="rounded-md border bg-card">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold tracking-tight">{t('ItemsTitle')}</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">{t('Product')}</TableHead>
            <TableHead>{t('Sku')}</TableHead>
            <TableHead className="text-right">{t('Price')}</TableHead>
            <TableHead className="text-right">{t('Qty')}</TableHead>
            <TableHead className="text-right">{t('Discount')}</TableHead>
            <TableHead className="text-right">{t('Total')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => {
            // Mapping fields from snapshot data
            const name = item.productNameSnapshot || 'Product';
            const price = item.unitPrice;
            const total = item.lineTotal;
            const qty = Number(item.quantity || 0);
            const sku = item.variantSkuSnapshot || item.productSkuSnapshot || '-';
            const variant = item.variantSkuSnapshot || '';

            return (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{name}</span>
                    {variant && <span className="text-xs text-muted-foreground">{variant}</span>}
                    {item.isSubstitute && (
                      <Badge
                        variant="outline"
                        data-testid="order-item-substitute-badge"
                        className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-300 w-fit mt-1"
                      >
                        {t('Substitute')}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono">{sku}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>
                      {currency} {formatEgp(price)}
                    </span>
                    {/* Placeholder for price change detection */}
                  </div>
                </TableCell>
                <TableCell className="text-right">{qty}</TableCell>
                <TableCell className="text-right">
                  {currency} {formatEgp(item.discountAmount)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {currency} {formatEgp(total)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
