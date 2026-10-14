'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { type Order } from '@findeg/orders';
import { Button } from '@findeg/ui';
import { Badge } from '@findeg/ui';
import { RefreshCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@findeg/ui';
import { getAllowedOrderStatusTransitions } from '@lib/order-presentation';
import { refundOrderAction } from '@data/orders/actions';
import { useRouter } from '@i18n/navigation';
import { useToast } from '@hooks/use-toast';

interface OrderHeaderProps {
  order: Order;
}

export function OrderHeader({ order }: OrderHeaderProps) {
  const t = useTranslations('Administration.OrdersDetail');
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleRefund = () => {
    startTransition(async () => {
      const result = await refundOrderAction(Number(order.id));

      if (result.success) {
        toast({ title: t('RefundSuccess') });
        setDialogOpen(false);
        router.refresh();
      } else {
        toast({ title: t('RefundFailed'), description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          {`${t('Order')} ${order.orderReference}`}
          <Badge variant="secondary" className="text-sm px-3 py-1 uppercase tracking-wider">
            {order.status}
          </Badge>
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('PlacedOn', { date: new Date(order.createdAt!).toLocaleString() })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {order.paymentStatus === 'paid' &&
          getAllowedOrderStatusTransitions(order.status).includes('refunded') && (
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  data-testid="order-refund-button"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {t('ProcessRefund')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('ConfirmRefundTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('ConfirmRefundDesc')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>{t('Cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRefund}
                    disabled={isPending}
                    data-testid="confirm-refund-button"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('ConfirmRefundAction')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
      </div>
    </div>
  );
}
