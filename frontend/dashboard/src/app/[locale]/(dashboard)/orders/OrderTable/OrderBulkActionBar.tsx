'use client';

import { useTransition } from 'react';
import { type Table } from '@tanstack/react-table';
import { type Order } from '@findeg/orders';
import { Button } from '@findeg/ui';
import { Check, Settings, Ban, X } from 'lucide-react';
import { toast } from '@hooks/use-toast';
import { useRouter } from '@i18n/navigation';
import { bulkUpdateOrderStatusAction } from '@data/orders/actions';
import type { OrderStatus } from '@findeg/domain/orders';

interface OrderBulkActionBarProps {
  table: Table<Order>;
  selectedIds: number[];
  onClearSelection: () => void;
}

export function OrderBulkActionBar({ selectedIds, onClearSelection }: OrderBulkActionBarProps) {
  const count = selectedIds.length;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (count === 0) return null;

  const updateSelected = (status: OrderStatus) => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      const result = await bulkUpdateOrderStatusAction(selectedIds, status);
      const updatedCount = 'updatedCount' in result ? (result.updatedCount ?? 0) : 0;
      if (updatedCount > 0) {
        onClearSelection();
        router.refresh();
      }
      if (!result.success) {
        toast({
          title: 'Update failed',
          description:
            updatedCount > 0
              ? `${updatedCount} updated; ${result.error}`
              : result.error || `Failed to mark selected Orders ${status}.`,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Orders updated',
        description: `${updatedCount} Order${updatedCount === 1 ? '' : 's'} marked ${status}.`,
      });
    });
  };

  const handleConfirmSelected = () => updateSelected('confirmed');

  const handleMarkProcessing = () => updateSelected('processing');

  const handleCancelSelected = () => {
    if (!window.confirm('Confirm that you want to cancel the selected orders.')) return;
    updateSelected('cancelled');
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background shadow-xl rounded-full px-6 py-3 flex items-center space-x-6 animate-in slide-in-from-bottom-5">
      <div className="flex items-center space-x-2">
        <span className="bg-background text-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {count}
        </span>
        <span className="text-sm font-medium">selected</span>
      </div>

      <div className="h-5 w-px bg-background/20" />

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-background hover:text-background hover:bg-background/20 h-8"
          disabled={isPending}
          data-testid="bulk-confirm-button"
          onClick={handleConfirmSelected}
        >
          <Check className="mr-2 h-4 w-4" />
          Confirm Selected
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-background hover:text-background hover:bg-background/20 h-8"
          disabled={isPending}
          data-testid="bulk-process-button"
          onClick={handleMarkProcessing}
        >
          <Settings className="mr-2 h-4 w-4" />
          Mark Processing
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-background hover:text-background hover:bg-background/20 h-8 text-rose-300 hover:text-rose-200"
          disabled={isPending}
          data-testid="bulk-cancel-button"
          onClick={handleCancelSelected}
        >
          <Ban className="mr-2 h-4 w-4" />
          Cancel Selected
        </Button>
      </div>

      <div className="h-5 w-px bg-background/20" />

      <Button
        variant="ghost"
        size="icon"
        className="text-background hover:text-background hover:bg-background/20 h-8 w-8 rounded-full"
        onClick={onClearSelection}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
