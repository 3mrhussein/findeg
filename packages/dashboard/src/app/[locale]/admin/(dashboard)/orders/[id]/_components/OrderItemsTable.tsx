"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@findeg/ui";
import { Badge } from "@findeg/ui";
import { AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@findeg/ui";

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
  variantName?: string;
  currentUnitPrice?: number; // Optional: to show price changes since order
}

interface OrderItemsTableProps {
  items: any[]; // Using any because OrderItem entity structure might vary slightly but we'll map
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
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => {
            // Mapping fields from snapshot data
            const name = item.productNameSnapshot || item.productName || "Product";
            const price = Number(item.unitPriceSnapshot || item.unitPrice || 0);
            const total = Number(item.totalPriceSnapshot || item.totalPrice || 0);
            const qty = Number(item.quantity || 0);
            const sku = item.skuSnapshot || item.sku || "-";
            const variant = item.variantNameSnapshot || item.variantName || "";

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
                      {currency} {price.toFixed(2)}
                    </span>
                    {/* Placeholder for price change detection */}
                  </div>
                </TableCell>
                <TableCell className="text-right">{qty}</TableCell>
                <TableCell className="text-right font-medium">
                  {currency} {total.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
