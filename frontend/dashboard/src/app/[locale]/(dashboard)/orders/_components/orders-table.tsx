"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui";
import { Button } from "@ui";
import { IconTooltip } from "@ui";
import { Order } from "@backend/features/order";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui";
import { updateOrderPaymentStatusAction, updateOrderStatusAction } from "@actions/order-actions";
import { useToast } from "@hooks/use-toast";
import { useState } from "react";
import { Link } from "@i18n/navigation";
import { Eye } from "lucide-react";
import { useRouter } from "@i18n/navigation";

/**
 * Local type definitions
 */
type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/**
 * Stub helper functions (to be reimplemented)
 */
const getAllowedOrderStatusTransitions = (status: OrderStatus): OrderStatus[] => [];
const getOrderStatusLabel = (status: OrderStatus): string => status;
const normalizeOrderStatus = (status: string | undefined): OrderStatus =>
  (status as OrderStatus) || "pending";
const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [];
const getAllowedPaymentStatusTransitions = (status: PaymentStatus): PaymentStatus[] => [];
const getPaymentStatusLabel = (status: PaymentStatus): string => status;
const normalizePaymentStatus = (status: string | undefined): PaymentStatus =>
  (status as PaymentStatus) || "pending";
const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [];

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
                            key={statusOption.value}
                            value={statusOption.value}
                            disabled={!selectableStatuses.has(statusOption.value)}
                          >
                            {getOrderStatusLabel(statusOption.value)}
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
                            key={paymentStatus.value}
                            value={paymentStatus.value}
                            disabled={!selectablePaymentStatuses.has(paymentStatus.value)}
                          >
                            {getPaymentStatusLabel(paymentStatus.value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <IconTooltip label="View order details" asChild>
                      <Button asChild variant="ghost" size="icon" aria-label="View order details">
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </IconTooltip>
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
