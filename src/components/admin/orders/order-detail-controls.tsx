"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import type { OrderStatus, PaymentStatus } from "@/features/core/domain/types/common";
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

interface OrderDetailControlsProps {
  orderId: number | string;
  initialStatus: string;
  initialPaymentStatus?: string;
  initialTrackingNumber?: string;
  initialAdminNotes?: string;
}

/**
 * Operational controls for admin order detail updates.
 */
export function OrderDetailControls({
  orderId,
  initialStatus,
  initialPaymentStatus,
  initialTrackingNumber,
  initialAdminNotes,
}: OrderDetailControlsProps) {
  const { toast } = useToast();
  const router = useRouter();

  const normalizedInitialStatus = normalizeOrderStatus(initialStatus);
  const allowedStatusTargets = getAllowedOrderStatusTransitions(normalizedInitialStatus);
  const selectableStatuses = new Set<OrderStatus>([
    normalizedInitialStatus,
    ...allowedStatusTargets,
  ]);

  const normalizedInitialPaymentStatus = normalizePaymentStatus(initialPaymentStatus);
  const allowedPaymentTargets = getAllowedPaymentStatusTransitions(normalizedInitialPaymentStatus);
  const selectablePaymentStatuses = new Set<PaymentStatus>([
    normalizedInitialPaymentStatus,
    ...allowedPaymentTargets,
  ]);

  const [status, setStatus] = useState<OrderStatus>(normalizedInitialStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(normalizedInitialPaymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || "");
  const [adminNotes, setAdminNotes] = useState(initialAdminNotes || "");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const resolveOrderId = (): number | null => {
    const numericOrderId = Number(orderId);
    if (Number.isFinite(numericOrderId)) return numericOrderId;

    toast({
      variant: "destructive",
      title: "Error",
      description: "Invalid order id.",
    });
    return null;
  };

  const saveStatusChanges = async () => {
    const numericOrderId = resolveOrderId();
    if (!numericOrderId) return;

    setSavingStatus(true);
    try {
      const result = await updateOrderStatusAction(numericOrderId, {
        status,
        trackingNumber: trackingNumber.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
      });

      if (result.success) {
        toast({
          title: "Order updated",
          description: `Order #${numericOrderId} status set to ${getOrderStatusLabel(status)}.`,
        });
        router.refresh();
        return;
      }

      toast({
        variant: "destructive",
        title: "Update failed",
        description: result.error || "Could not update order.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Unexpected error while updating order.",
      });
    } finally {
      setSavingStatus(false);
    }
  };

  const savePaymentChanges = async () => {
    const numericOrderId = resolveOrderId();
    if (!numericOrderId) return;

    setSavingPayment(true);
    try {
      const result = await updateOrderPaymentStatusAction(numericOrderId, paymentStatus);

      if (result.success) {
        toast({
          title: "Payment updated",
          description: `Order #${numericOrderId} payment set to ${getPaymentStatusLabel(paymentStatus)}.`,
        });
        router.refresh();
        return;
      }

      toast({
        variant: "destructive",
        title: "Update failed",
        description: result.error || "Could not update payment status.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Unexpected error while updating payment status.",
      });
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Operations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="order-status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as OrderStatus)}
            disabled={savingStatus || savingPayment}
          >
            <SelectTrigger id="order-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option} disabled={!selectableStatuses.has(option)}>
                  {getOrderStatusLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Allowed next statuses:{" "}
            {allowedStatusTargets.length > 0
              ? allowedStatusTargets.map((target) => getOrderStatusLabel(target)).join(", ")
              : "No further transitions"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order-tracking">Tracking Number</Label>
          <Input
            id="order-tracking"
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="Optional courier tracking number"
            disabled={savingStatus || savingPayment}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order-admin-notes">Internal Notes</Label>
          <Textarea
            id="order-admin-notes"
            value={adminNotes}
            onChange={(event) => setAdminNotes(event.target.value)}
            placeholder="Optional operational notes"
            disabled={savingStatus || savingPayment}
          />
        </div>

        <Button type="button" onClick={saveStatusChanges} disabled={savingStatus || savingPayment}>
          {savingStatus ? "Saving..." : "Save Status + Notes"}
        </Button>

        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="order-payment-status">Payment Status</Label>
          <Select
            value={paymentStatus}
            onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
            disabled={savingStatus || savingPayment}
          >
            <SelectTrigger id="order-payment-status">
              <SelectValue placeholder="Select payment status" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  disabled={!selectablePaymentStatuses.has(option)}
                >
                  {getPaymentStatusLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Allowed next payment statuses:{" "}
            {allowedPaymentTargets.length > 0
              ? allowedPaymentTargets.map((target) => getPaymentStatusLabel(target)).join(", ")
              : "No further transitions"}
          </p>

          <Button type="button" onClick={savePaymentChanges} disabled={savingStatus || savingPayment}>
            {savingPayment ? "Saving..." : "Save Payment Status"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
