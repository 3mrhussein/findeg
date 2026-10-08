'use client';

import { useTransition, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { CreditCard, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@findeg/ui';
import { Button } from '@findeg/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Label } from '@findeg/ui';
import {
  getAllowedOrderStatusTransitions,
  getAllowedPaymentStatusTransitions,
} from '@findeg/backend/features/order/schemas';
import {
  updateOrderStatusAction as adminUpdateOrderStatusAction,
  updateOrderPaymentStatusAction,
} from '@actions/order-actions';

import { useRouter } from '@i18n/navigation';
import { useToast } from '@hooks/use-toast';

/**
 * OrderStatus type (local definition)
 */
type OrderStatus =
  'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

interface OrderPaymentFulfillmentProps {
  order: import('@findeg/backend/features/order').Order;
}

const STATUS_FLOW: { label: string; value: OrderStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const paymentActionLabel = (target: PaymentStatus) => `Mark as ${target}`;

/**
 *
 */
export function OrderPaymentFulfillment({ order }: OrderPaymentFulfillmentProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const allowedTargets = getAllowedOrderStatusTransitions(order.status);
  const paymentTargets = getAllowedPaymentStatusTransitions(order.paymentStatus ?? 'unpaid');
  // A delivered Order's only next status is refunded, which the header's refund action owns.
  const hasSelectableTarget = STATUS_FLOW.some((s) => allowedTargets.includes(s.value));

  /**
   * Runs one order write and reports the outcome. A rejected request (network failure,
   * server error) is shown as a failed update rather than escaping as an unhandled rejection.
   */
  const runUpdate = (
    write: () => Promise<{ success: boolean; error?: string }>,
    successTitle: string,
  ) => {
    startTransition(async () => {
      try {
        const result = await write();
        if (result.success) {
          toast({ title: successTitle });
          // The page is rendered from the database on demand; re-render it with the new state.
          router.refresh();
        } else {
          toast({ title: 'Update failed', description: result.error, variant: 'destructive' });
        }
      } catch {
        toast({
          title: 'Update failed',
          description: 'The update request failed. Check your connection and try again.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleStatusChange = (newStatus: string) =>
    runUpdate(
      () =>
        adminUpdateOrderStatusAction(Number(order.id), {
          status: newStatus as OrderStatus,
          trackingNumber: trackingNumber || undefined,
        }),
      'Order status updated',
    );

  const handleUpdateTracking = () =>
    runUpdate(
      () =>
        adminUpdateOrderStatusAction(Number(order.id), {
          status: order.status,
          trackingNumber: trackingNumber || undefined,
        }),
      'Tracking information updated',
    );

  const handlePaymentChange = (paymentStatus: PaymentStatus) =>
    runUpdate(
      () => updateOrderPaymentStatusAction(Number(order.id), paymentStatus),
      'Payment status updated',
    );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center space-y-0 gap-2">
        <CreditCard className="w-4 h-4 text-primary" />
        <CardTitle className="text-sm font-bold uppercase tracking-wider">
          Payment & Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-tight">
              Payment Status
            </span>
            <span className="font-semibold capitalize">{order.paymentStatus}</span>
          </div>
          <Badge
            data-testid="order-payment-badge"
            variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
          >
            {order.paymentStatus === 'paid' ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <AlertCircle className="w-3 h-3 mr-1" />
            )}
            {order.paymentStatus}
          </Badge>
        </div>

        {paymentTargets.length > 0 && (
          <div className="flex gap-2" data-testid="order-payment-actions">
            {paymentTargets.map((target) => (
              <Button
                key={target}
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => handlePaymentChange(target)}
              >
                {paymentActionLabel(target)}
              </Button>
            ))}
          </div>
        )}

        {/* Change Logistical Status */}
        <div className="space-y-2">
          <Label className="text-xs uppercase text-muted-foreground">Logistical Status</Label>
          <Select
            disabled={isPending || !hasSelectableTarget}
            onValueChange={handleStatusChange}
            // Controlled by the persisted status: a rejected update snaps back, a refresh follows.
            value={order.status}
          >
            <SelectTrigger className="w-full" data-testid="order-status-select">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FLOW.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  disabled={s.value !== order.status && !allowedTargets.includes(s.value)}
                >
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {order.status === 'shipped' && (
            <p className="text-xs text-muted-foreground">
              Cancel a shipped Order only once the parcel is back in the warehouse: cancelling
              returns its units to available stock.
            </p>
          )}
        </div>

        {/* Tracking Number */}
        <div className="space-y-3 pt-2 border-t text-sm">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Fulfillment Tracking</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="AWB / Tracking #"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={isPending}
              className="h-9"
            />
            <Button
              size="sm"
              onClick={handleUpdateTracking}
              disabled={isPending || !trackingNumber || trackingNumber === order.trackingNumber}
              className="h-9"
            >
              Update
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
