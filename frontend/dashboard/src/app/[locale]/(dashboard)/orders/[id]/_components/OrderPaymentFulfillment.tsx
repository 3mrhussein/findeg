'use client';

import { useTransition, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { CreditCard, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@findeg/ui';
import { Button } from '@findeg/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Label } from '@findeg/ui';
import {
  confirmStatusUpdate,
  getAllowedOrderStatusTransitions,
  getAllowedPaymentStatusTransitions,
} from '@lib/order-presentation';
import {
  updateOrderStatusAction as adminUpdateOrderStatusAction,
  updateOrderPaymentStatusAction,
} from '@data/orders/actions';

import { useRouter } from '@i18n/navigation';
import { useToast } from '@hooks/use-toast';

import type { OrderStatus, PaymentStatus } from '@findeg/domain/orders';

interface OrderPaymentFulfillmentProps {
  order: import('@findeg/orders').Order;
}

const STATUS_FLOW: { label: string; value: OrderStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

/**
 *
 */
export function OrderPaymentFulfillment({ order }: OrderPaymentFulfillmentProps) {
  const t = useTranslations('Administration.OrdersDetail');
  const ts = useTranslations('Administration.Shared.StatusBadge');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const allowedTargets = getAllowedOrderStatusTransitions(order.status);
  const paymentTargets = getAllowedPaymentStatusTransitions(order);
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
          toast({ title: t('UpdateFailed'), description: result.error, variant: 'destructive' });
        }
      } catch {
        toast({
          title: t('UpdateFailed'),
          description: t('RequestFailed'),
          variant: 'destructive',
        });
      }
    });
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'shipped' && !trackingNumber.trim()) {
      toast({
        title: t('UpdateFailed'),
        description: t('TrackingRequired'),
        variant: 'destructive',
      });
      return;
    }
    const update = confirmStatusUpdate(order.status, newStatus as OrderStatus, {
      parcelBack: t('ConfirmParcelBack'),
      cancel: t('ConfirmCancel'),
    });
    if (!update) return;
    runUpdate(
      () =>
        adminUpdateOrderStatusAction(Number(order.id), {
          ...update,
          trackingNumber: trackingNumber.trim() || undefined,
        }),
      t('StatusUpdated'),
    );
  };

  const handleUpdateTracking = () =>
    runUpdate(
      () =>
        adminUpdateOrderStatusAction(Number(order.id), {
          status: order.status,
          trackingNumber: trackingNumber.trim() || undefined,
        }),
      t('TrackingUpdated'),
    );

  const handlePaymentChange = (paymentStatus: PaymentStatus) =>
    runUpdate(
      () => updateOrderPaymentStatusAction(Number(order.id), paymentStatus),
      t('PaymentUpdated'),
    );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center space-y-0 gap-2">
        <CreditCard className="w-4 h-4 text-primary" />
        <CardTitle className="text-sm font-bold uppercase tracking-wider">
          {t('PaymentAndStatus')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-tight">
              {t('PaymentStatus')}
            </span>
            <span className="font-semibold capitalize">
              {ts(order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1))}
            </span>
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
            {ts(order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1))}
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
                {t('MarkPayment', { status: ts(target.charAt(0).toUpperCase() + target.slice(1)) })}
              </Button>
            ))}
          </div>
        )}

        {/* Change Logistical Status */}
        <div className="space-y-2">
          <Label className="text-xs uppercase text-muted-foreground">{t('LogisticalStatus')}</Label>
          <Select
            disabled={isPending || !hasSelectableTarget}
            onValueChange={handleStatusChange}
            // Controlled by the persisted status: a rejected update snaps back, a refresh follows.
            value={order.status}
          >
            <SelectTrigger className="w-full" data-testid="order-status-select">
              <SelectValue placeholder={t('SelectStatus')} />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FLOW.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  disabled={s.value !== order.status && !allowedTargets.includes(s.value)}
                >
                  {ts(s.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {order.status === 'shipped' && (
            <p className="text-xs text-muted-foreground">{t('ShippedCancelHint')}</p>
          )}
        </div>

        {/* Tracking Number */}
        <div className="space-y-3 pt-2 border-t text-sm">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{t('FulfillmentTracking')}</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={t('TrackingPlaceholder')}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={isPending}
              data-testid="order-tracking-input"
              className="h-9"
            />
            <Button
              size="sm"
              onClick={handleUpdateTracking}
              disabled={isPending || !trackingNumber || trackingNumber === order.trackingNumber}
              data-testid="order-tracking-update-button"
              className="h-9"
            >
              {t('Update')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
