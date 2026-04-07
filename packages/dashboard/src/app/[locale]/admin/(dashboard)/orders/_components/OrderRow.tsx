"use client";

import { useState } from "react";
import { EnrichedTableRow } from "@app/[locale]/admin/_components/table/EnrichedTableRow";
import { StatusBadge } from "@components/shared/StatusBadge";
import { Package, User, CreditCard, MapPin, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@lib/utils";
import { OrderTimeline } from "./OrderTimeline";
import type { Order } from "@backend/features/order";

interface OrderRowProps {
  order: Order;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onOpenDetail: (order: Order) => void;
}

export function OrderRow({ order, isSelected, onSelect, onOpenDetail }: OrderRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute display values
  const orderNumber = `#${order.id}`;
  const customerName = order.customerName || order.guestEmail || "Guest";
  const itemsCount = order.items?.length || 0;
  const totalAmount = `${order.currency || "EGP"} ${order.totalAmount?.toFixed(2) || "0.00"}`;
  const timeAgo = order.createdAt
    ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })
    : "Unknown";

  // Order status badge variant is not needed - StatusBadge handles styles internally

  const compactContent = (
    <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center py-3 px-4">
      {/* Order Number */}
      <div className="font-mono text-sm font-semibold">{orderNumber}</div>

      {/* Customer */}
      <div className="flex items-center gap-2 min-w-0">
        <User className="size-4 text-muted-foreground shrink-0" />
        <span className="text-sm truncate">{customerName}</span>
      </div>

      {/* Items Count */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Package className="size-4" />
        <span className="text-sm">{itemsCount}</span>
      </div>

      {/* Total Amount */}
      <div className="text-sm font-semibold">{totalAmount}</div>

      {/* Status */}
      <StatusBadge status={order.status} />

      {/* Time */}
      <div className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</div>
    </div>
  );

  const expandedContent = (
    <div className="px-4 pb-4 space-y-4 border-t">
      <div className="grid grid-cols-2 gap-6 pt-4">
        {/* Left Column: Order Items */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Package className="size-4" />
            Order Items ({itemsCount})
          </h4>
          <div className="space-y-2">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 border"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {item.productNameSnapshot || "Unknown Product"}
                  </div>
                  {item.productSkuSnapshot && (
                    <div className="text-xs text-muted-foreground font-mono">
                      SKU: {item.productSkuSnapshot}
                    </div>
                  )}
                  {item.variantSnapshot?.label && (
                    <div className="text-xs text-muted-foreground">
                      Variant: {item.variantSnapshot.label}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Qty: {item.quantity} {item.uomCode || "unit"}
                  </div>
                </div>
                <div className="text-sm font-semibold whitespace-nowrap">
                  {order.currency || "EGP"} {item.totalPrice?.toFixed(2) || "0.00"}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>
                {order.currency || "EGP"} {order.subtotal?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping:</span>
              <span>
                {order.currency || "EGP"} {order.shippingCost?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t">
              <span>Total:</span>
              <span>{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Details */}
        <div className="space-y-4">
          {/* Order Status Timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Order Status</h4>
            <OrderTimeline currentStatus={order.status} />
          </div>

          {/* Payment Status */}
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Payment:</span>
            <span className="text-sm font-medium capitalize">
              {order.paymentStatus || "unpaid"}
            </span>
          </div>

          {/* Payment Method */}
          {order.paymentMethod && (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Method:</span>
              <span className="font-medium capitalize">{order.paymentMethod}</span>
            </div>
          )}

          {/* Tracking Number */}
          {order.trackingNumber && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Tracking Number:</div>
              <div className="font-mono text-sm bg-muted px-3 py-2 rounded border">
                {order.trackingNumber}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingAddressSnapshot && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="size-4" />
                Shipping Address
              </h4>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded border">
                <div className="space-y-0.5">
                  <div>{order.shippingAddressSnapshot.fullName}</div>
                  <div>{order.shippingAddressSnapshot.phone}</div>
                  <div>
                    {order.shippingAddressSnapshot.street}
                    {order.shippingAddressSnapshot.building &&
                      `, Building ${order.shippingAddressSnapshot.building}`}
                    {order.shippingAddressSnapshot.floor &&
                      `, Floor ${order.shippingAddressSnapshot.floor}`}
                    {order.shippingAddressSnapshot.apartment &&
                      `, Apt ${order.shippingAddressSnapshot.apartment}`}
                  </div>
                  <div>
                    {order.shippingAddressSnapshot.area}, {order.shippingAddressSnapshot.city}
                  </div>
                  {order.shippingAddressSnapshot.notes && (
                    <div className="text-xs mt-1">Notes: {order.shippingAddressSnapshot.notes}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {order.adminNotes && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="size-4" />
                Admin Notes
              </h4>
              <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200 dark:border-amber-800">
                {order.adminNotes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Full Details Button */}
      <div className="pt-2 border-t">
        <button
          onClick={() => onOpenDetail(order)}
          className="text-sm text-primary hover:underline font-medium"
        >
          View Full Order Details →
        </button>
      </div>
    </div>
  );

  return (
    <EnrichedTableRow
      id={order.id}
      isSelected={isSelected}
      isExpanded={isExpanded}
      onSelectChange={onSelect}
      onToggle={() => setIsExpanded(!isExpanded)}
      compactContent={compactContent}
      expandedContent={expandedContent}
    />
  );
}
