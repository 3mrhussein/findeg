'use client';
import { ORDER_STATUSES, type OrderStatus } from '@findeg/domain';

import { useTransition } from 'react';
import { Badge } from '@findeg/ui';
import { ScrollArea, ScrollBar } from '@findeg/ui';
import { Button } from '@findeg/ui';

interface OrderStatusPillsProps {
  statusCounts: Record<string, number>;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  total: number;
}

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
} satisfies Record<OrderStatus, string>;
const STATUSES = [
  { value: 'all', label: 'All' },
  ...ORDER_STATUSES.filter((status) => status !== 'refunded').map((value) => ({
    value,
    label: statusLabels[value],
  })),
];

/**
 *
 */
export function OrderStatusPills({
  statusCounts,
  activeStatus,
  onStatusChange,
  total,
}: OrderStatusPillsProps) {
  const [isPending, startTransition] = useTransition();

  /**
   *
   */
  const handleStatusClick = (status: string) => {
    if (activeStatus === status) return;
    startTransition(() => {
      onStatusChange(status);
    });
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap pb-4">
      <div className="flex w-max space-x-2">
        {STATUSES.map((status) => {
          const count = status.value === 'all' ? total : statusCounts[status.value] || 0;
          const isActive = activeStatus === status.value;

          return (
            <Button
              key={status.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full shadow-sm transition-opacity ${isPending ? 'opacity-70' : 'opacity-100'}`}
              onClick={() => handleStatusClick(status.value)}
            >
              {status.label}
              <Badge
                variant={isActive ? 'secondary' : 'default'}
                className="ml-2 bg-background/20 hover:bg-background/20 border-transparent text-current px-1.5 py-0 min-w-4 text-center"
              >
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}
