"use client";

import React from "react";
import type { Order } from "@/domain/entities/Order";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 *
 */
const OrderStatusBadge: React.FC<{ status: Order["status"] }> = ({ status }) => {
  const statusClasses: Record<string, string> = {
    processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

interface OrderTableUIProps {
  orders: Order[];
  t: (key: any) => string;
}

/**
 *
 */
export const OrderTableUI: React.FC<OrderTableUIProps> = ({ orders, t }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{t("Pages.Dashboard.Table.OrderId")}</TableHead>
        <TableHead>{t("Pages.Dashboard.Table.Customer")}</TableHead>
        <TableHead>{t("Pages.Dashboard.Table.Date")}</TableHead>
        <TableHead>{t("Pages.Dashboard.Table.Total")}</TableHead>
        <TableHead>{t("Pages.Dashboard.Table.Status")}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {orders.map((order) => (
        <TableRow key={order.id}>
          <TableCell className="font-medium text-foreground">{order.id}</TableCell>
          <TableCell>{order.customerName}</TableCell>
          <TableCell>{order.date}</TableCell>
          <TableCell>${(order.total ?? order.totalAmount ?? 0).toFixed(2)}</TableCell>
          <TableCell>
            <OrderStatusBadge status={order.status} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

interface OrderTableProps {
  orders: Order[];
}

/**
 *
 */
export const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  const t = useTranslations();
  return <OrderTableUI orders={orders} t={t} />;
};
