'use client';

import { useTransition } from 'react';
import { type Table } from '@tanstack/react-table';
import { type Order } from '@findeg/backend/features/order';
import { Button } from '@findeg/ui';
import { Check, Settings, Printer, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@i18n/navigation';
import { bulkUpdateOrderStatusAction } from '@/data/orders/actions';
import type { OrderStatus } from '@findeg/backend/features/core';

interface OrderBulkActionBarProps {
  table: Table<Order>;
}

/**
 *
 */
export function OrderBulkActionBar({ table }: OrderBulkActionBarProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const count = selectedRows.length;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (count === 0) return null;

  /**
   *
   */
  const updateSelected = (status: OrderStatus, eligibleStatus: OrderStatus) => {
    const ids = selectedRows
      .filter((row) => row.original.status === eligibleStatus)
      .map((row) => Number(row.original.id));
    if (ids.length === 0) {
      toast.error(`No selected Orders can be marked ${status}.`);
      return;
    }

    startTransition(async () => {
      const result = await bulkUpdateOrderStatusAction(ids, status);
      const updatedCount = 'updatedCount' in result ? (result.updatedCount ?? 0) : 0;
      if (updatedCount > 0) {
        table.resetRowSelection();
        router.refresh();
      }
      if (!result.success) {
        toast.error(
          updatedCount > 0
            ? `${updatedCount} updated; ${result.error}`
            : result.error || `Failed to mark selected Orders ${status}.`,
        );
        return;
      }
      toast.success(`${updatedCount} Order${updatedCount === 1 ? '' : 's'} marked ${status}.`);
    });
  };

  const handleConfirmSelected = () => updateSelected('confirmed', 'pending');

  /**
   *
   */
  const handleMarkProcessing = () => updateSelected('processing', 'confirmed');

  /**
   *
   */
  const handlePrintSelected = () => {
    // Printing logic
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
          onClick={handleMarkProcessing}
        >
          <Settings className="mr-2 h-4 w-4" />
          Mark Processing
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-background hover:text-background hover:bg-background/20 h-8"
          disabled={isPending}
          onClick={handlePrintSelected}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Packing Slips
        </Button>
      </div>

      <div className="h-5 w-px bg-background/20" />

      <Button
        variant="ghost"
        size="icon"
        className="text-background hover:text-background hover:bg-background/20 h-8 w-8 rounded-full"
        onClick={() => table.toggleAllRowsSelected(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
