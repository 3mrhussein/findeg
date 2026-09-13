'use client';

import { SlideOver } from '@/app/[locale]/_components/shared/SlideOver';
import { StatusBadge } from '@components/shared/StatusBadge';
import { OrderTimeline } from './OrderTimeline';
import {
  Package,
  User,
  CreditCard,
  MapPin,
  FileText,
  Truck,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Order } from '@findeg/backend/features/order';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus?: (orderId: string, status: string) => Promise<void>;
  onUpdatePaymentStatus?: (orderId: string, paymentStatus: string) => Promise<void>;
  onAddNote?: (orderId: string, note: string) => Promise<void>;
}

export function OrderDetailDrawer({
  order,
  isOpen,
  onOpenChange,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onAddNote,
}: OrderDetailDrawerProps) {
  if (!order) return null;

  const orderNumber = `#${order.id}`;
  const customerName = order.customerName || order.guestEmail || 'Guest';
  const itemsCount = order.items?.length || 0;
  const totalAmount = `${order.currency || 'EGP'} ${order.totalAmount?.toFixed(2) || '0.00'}`;

  return (
    <SlideOver
      open={isOpen}
      onOpenChange={onOpenChange}
      title={`Order ${orderNumber}`}
      description={`Placed ${order.createdAt ? format(new Date(order.createdAt), 'PPp') : 'Unknown'}`}
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{totalAmount}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="size-4" />
              <span>{itemsCount} items</span>
            </div>
          </div>
          <div className="space-y-2 text-end">
            <StatusBadge status={order.status} />
            <div className="flex items-center gap-2 justify-end text-sm">
              <span className="text-muted-foreground">Payment:</span>
              <span className="font-medium capitalize">{order.paymentStatus || 'unpaid'}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <User className="size-4" />
            Customer Information
          </h3>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="text-sm font-medium">{customerName}</span>
            </div>
            {order.customerEmail && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium">{order.customerEmail}</span>
              </div>
            )}
            {order.userId && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">User ID:</span>
                <span className="text-sm font-mono">{order.userId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Order Status</h3>
          <OrderTimeline currentStatus={order.status} />
        </div>

        {/* Order Items */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Package className="size-4" />
            Order Items
          </h3>
          <div className="space-y-2">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 border"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="font-medium text-sm">
                    {item.productNameSnapshot || 'Unknown Product'}
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
                  <div className="text-xs text-muted-foreground">
                    {item.quantity} {item.uomCode || 'unit'} × {order.currency || 'EGP'}{' '}
                    {item.unitPrice?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="text-sm font-semibold whitespace-nowrap">
                  {order.currency || 'EGP'} {item.totalPrice?.toFixed(2) || '0.00'}
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="space-y-2 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>
                {order.currency || 'EGP'} {order.subtotal?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping:</span>
              <span>
                {order.currency || 'EGP'} {order.shippingCost?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment & Shipping Details */}
        <div className="space-y-4">
          {/* Payment Method */}
          {order.paymentMethod && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="size-4" />
                Payment Method
              </h3>
              <div className="bg-muted/50 rounded-lg p-3">
                <span className="text-sm font-medium capitalize">{order.paymentMethod}</span>
              </div>
            </div>
          )}

          {/* Tracking Number */}
          {order.trackingNumber && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Truck className="size-4" />
                Tracking Number
              </h3>
              <div className="font-mono text-sm bg-muted/50 px-3 py-2 rounded-lg border">
                {order.trackingNumber}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingAddressSnapshot && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="size-4" />
                Shipping Address
              </h3>
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
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
                  <div className="text-xs mt-1 text-muted-foreground">
                    Notes: {order.shippingAddressSnapshot.notes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Notes */}
        {order.adminNotes && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="size-4" />
              Admin Notes
            </h3>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 text-sm border border-amber-200 dark:border-amber-800">
              {order.adminNotes}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="size-4" />
            Timestamps
          </h3>
          <div className="space-y-1 text-sm">
            {order.createdAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-mono">{format(new Date(order.createdAt), 'PPp')}</span>
              </div>
            )}
            {order.updatedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span className="font-mono">{format(new Date(order.updatedAt), 'PPp')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons (Optional - if callbacks provided) */}
        {(onUpdateStatus || onUpdatePaymentStatus || onAddNote) && (
          <div className="pt-4 border-t space-y-3">
            <h3 className="text-sm font-semibold">Admin Actions</h3>
            <div className="text-sm text-muted-foreground">
              Use the controls above to update order status, payment status, or add admin notes.
            </div>
            {/* TODO: Add actual action controls when server actions are ready */}
          </div>
        )}
      </div>
    </SlideOver>
  );
}
