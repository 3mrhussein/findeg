'use client';

import React from 'react';
import type { Order } from '@/types';
import { useTranslation } from '@/presentation/shared/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/presentation/shared/ui/table';

const OrderStatusBadge: React.FC<{status: Order['status']}> = ({ status }) => {
    const statusClasses = {
        processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        delivered: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>{status}</span>
}

interface OrderTableUIProps {
    orders: Order[];
    t: (key: any) => string;
}

export const OrderTableUI: React.FC<OrderTableUIProps> = ({ orders, t }) => (
     <Table>
        <TableHeader>
            <TableRow>
                <TableHead>{t('table_header_order_id')}</TableHead>
                <TableHead>{t('table_header_customer')}</TableHead>
                <TableHead>{t('table_header_date')}</TableHead>
                <TableHead>{t('table_header_total')}</TableHead>
                <TableHead>{t('table_header_status')}</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {orders.map(order => (
                <TableRow key={order.id}>
                    <TableCell className="font-medium text-foreground">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

interface OrderTableProps {
    orders: Order[];
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
    const { t } = useTranslation();
    return <OrderTableUI orders={orders} t={t} />;
};
