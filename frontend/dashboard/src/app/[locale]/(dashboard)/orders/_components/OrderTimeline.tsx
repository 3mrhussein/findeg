import { Check, Circle, X } from 'lucide-react';
import { cn } from '@lib/utils';

/**
 * OrderStatus type (local definition)
 */
type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  className?: string;
}

const TIMELINE_STEPS = [
  { status: 'pending', label: 'Pending' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
] as const;

const CANCELLED_STATUS = { status: 'cancelled', label: 'Cancelled' };

export function OrderTimeline({ currentStatus, className }: OrderTimelineProps) {
  // If order is cancelled, show special timeline
  if (currentStatus === 'cancelled') {
    return (
      <div className={cn('flex items-center gap-3 py-2', className)}>
        <div className="size-6 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center">
          <X className="size-3 text-destructive" />
        </div>
        <span className="text-sm font-medium text-destructive">Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = TIMELINE_STEPS.findIndex((step) => step.status === currentStatus);

  return (
    <div className={cn('space-y-3', className)}>
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={step.status} className="flex items-center gap-3">
            {/* Icon */}
            <div
              className={cn(
                'size-6 rounded-full flex items-center justify-center border-2 transition-colors',
                isCompleted && 'bg-primary border-primary',
                isCurrent && 'bg-primary/10 border-primary',
                isPending && 'bg-muted border-muted-foreground/20',
              )}
            >
              {isCompleted && <Check className="size-3 text-primary-foreground" />}
              {isCurrent && <Circle className="size-3 text-primary fill-current" />}
              {isPending && <Circle className="size-3 text-muted-foreground/40" />}
            </div>

            {/* Label */}
            <span
              className={cn(
                'text-sm transition-colors',
                isCompleted && 'text-foreground font-medium',
                isCurrent && 'text-primary font-semibold',
                isPending && 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
