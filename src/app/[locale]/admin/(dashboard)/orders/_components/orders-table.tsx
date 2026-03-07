"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Order } from "@/features/order/domain/entities/Order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateOrderPaymentStatusAction,
  updateOrderStatusAction,
} from "@/features/order/application/actions/order";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { OrderStatus, PaymentStatus } from "@/features/core/domain/types/common";
import { useRouter } from "next/navigation";
import {
  getAllowedOrderStatusTransitions,
  getOrderStatusLabel,
  normalizeOrderStatus,
  ORDER_STATUS_OPTIONS,
} from "@/features/order/application/utils/order-status-transitions";
import {
  getAllowedPaymentStatusTransitions,
  getPaymentStatusLabel,
  normalizePaymentStatus,
  PAYMENT_STATUS_OPTIONS,
} from "@/features/order/application/utils/order-payment-status-transitions";

interface OrdersTableProps {
  orders: Order[];
}

/**
 *
 */
export function OrdersTable({ orders }: OrdersTableProps) {
  const { toast } = useToast();
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<number | null>(null);
  const router = useRouter();

  /**
   *
   */
  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingStatusId(orderId);
    try {
      const result = await updateOrderStatusAction(orderId, { status: newStatus });
      if (result.success) {
        toast({
          title: "Status updated",
          description: `Order #${orderId} status changed to ${newStatus}.`,
        });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status." });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  /**
   *
   */
  const handlePaymentStatusChange = async (orderId: number, newPaymentStatus: PaymentStatus) => {
    setUpdatingPaymentId(orderId);
    try {
      const result = await updateOrderPaymentStatusAction(orderId, newPaymentStatus);
      if (result.success) {
        toast({
          title: "Payment status updated",
          description: `Order #${orderId} payment changed to ${getPaymentStatusLabel(newPaymentStatus)}.`,
        });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment status.",
      });
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const currentStatus = normalizeOrderStatus(order.status);
              const allowedTargets = getAllowedOrderStatusTransitions(currentStatus);
              const selectableStatuses = new Set<OrderStatus>([currentStatus, ...allowedTargets]);
              const currentPaymentStatus = normalizePaymentStatus(order.paymentStatus);
              const allowedPaymentTargets =
                getAllowedPaymentStatusTransitions(currentPaymentStatus);
              const selectablePaymentStatuses = new Set<PaymentStatus>([
                currentPaymentStatus,
                ...allowedPaymentTargets,
              ]);

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    {order.date ? new Date(order.date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    {order.currency} {order.total}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={currentStatus}
                      onValueChange={(val) =>
                        handleStatusChange(Number(order.id), val as OrderStatus)
                      }
                      disabled={updatingStatusId === order.id}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_OPTIONS.map((statusOption) => (
                          <SelectItem
                            key={statusOption}
                            value={statusOption}
                            disabled={!selectableStatuses.has(statusOption)}
                          >
                            {getOrderStatusLabel(statusOption)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={currentPaymentStatus}
                      onValueChange={(val) =>
                        handlePaymentStatusChange(Number(order.id), val as PaymentStatus)
                      }
                      disabled={updatingPaymentId === order.id}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUS_OPTIONS.map((paymentStatus) => (
                          <SelectItem
                            key={paymentStatus}
                            value={paymentStatus}
                            disabled={!selectablePaymentStatuses.has(paymentStatus)}
                          >
                            {getPaymentStatusLabel(paymentStatus)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
