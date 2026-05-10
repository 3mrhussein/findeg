'use client';

import { useState, useMemo } from 'react';
import { EnrichedTable } from '@/app/[locale]/_components/table/EnrichedTable';
import { BulkActionsBar } from '@/app/[locale]/_components/shared/BulkActionsBar';
import type { BulkAction } from '@/app/[locale]/_components/shared/BulkActionsBar';
import { OrderStatusTabs } from './OrderStatusTabs';
import { OrderRow } from './OrderRow';
import { OrderDetailDrawer } from './OrderDetailDrawer';
import type { Order } from '@findeg/backend/features/order';
import { EmptyState } from '@findeg/ui';

interface OrdersTableProps {
  orders: Order[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  statusFilter?: string;
}

export function OrdersTable({
  orders,
  totalCount,
  currentPage,
  pageSize,
  statusFilter,
}: OrdersTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    // In a real implementation, these would come from the server
    // For now, we'll use the current orders list as a proxy
    const counts = {
      all: totalCount,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      if (order.status in counts) {
        counts[order.status as keyof typeof counts]++;
      }
    });

    return counts;
  }, [orders, totalCount]);

  const handleSelect = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedIds(newSelected);
  };

  const handleOpenDetail = (order: Order) => {
    setDetailOrder(order);
    setIsDetailOpen(true);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    console.log('Bulk export orders:', Array.from(selectedIds));
    // TODO: Implement bulk export
  };

  const handleBulkCancel = () => {
    console.log('Bulk cancel orders:', Array.from(selectedIds));
    // TODO: Implement bulk cancel with confirmation
  };

  const bulkActions: BulkAction[] = [
    {
      key: 'export',
      label: 'Export Selected',
      onClick: handleBulkExport,
    },
    {
      key: 'cancel',
      label: 'Cancel Orders',
      onClick: handleBulkCancel,
      variant: 'destructive' as const,
    },
  ];

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <OrderStatusTabs counts={statusCounts} />
        <EmptyState
          title="No orders found"
          description="Try adjusting your filters or wait for new orders."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <OrderStatusTabs counts={statusCounts} />

      {/* Table */}
      <div className="relative">
        <EnrichedTable
          columns={[
            { key: 'order', label: 'Order #' },
            { key: 'customer', label: 'Customer' },
            { key: 'items', label: 'Items' },
            { key: 'total', label: 'Total' },
            { key: 'status', label: 'Status' },
            { key: 'date', label: 'Date' },
          ]}
          showCheckbox
          showExpand
        >
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              isSelected={selectedIds.has(String(order.id))}
              onSelect={(checked) => handleSelect(String(order.id), checked)}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </EnrichedTable>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedIds.size}
            actions={bulkActions}
            onClear={handleClearSelection}
          />
        )}
      </div>

      {/* Detail Drawer */}
      <OrderDetailDrawer order={detailOrder} isOpen={isDetailOpen} onOpenChange={setIsDetailOpen} />
    </div>
  );
}
