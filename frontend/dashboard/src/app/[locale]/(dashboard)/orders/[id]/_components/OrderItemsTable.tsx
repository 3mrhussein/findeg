'use client';

import { piastersToEgp } from '@findeg/money';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@findeg/ui';

interface OrderItemsTableProps {
  items: import('@findeg/orders').OrderItem[];
  currency: string;
}

/**
 *
 */
export function OrderItemsTable({ items, currency }: OrderItemsTableProps) {
  return (
    <div className="rounded-md border bg-card">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold tracking-tight">Order Items</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Discount</TableHead>
            <TableHead className="text-right">Total</TableHead>
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
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono">{sku}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>
                      {currency} {piastersToEgp(price)}
                    </span>
                    {/* Placeholder for price change detection */}
                  </div>
                </TableCell>
                <TableCell className="text-right">{qty}</TableCell>
                <TableCell className="text-right">
                  {currency} {piastersToEgp(item.discountAmount)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {currency} {piastersToEgp(total)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
