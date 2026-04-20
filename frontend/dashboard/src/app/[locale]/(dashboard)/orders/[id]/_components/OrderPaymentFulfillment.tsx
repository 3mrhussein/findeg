"use client";

import { useTransition, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@findeg/ui";
import { CreditCard, Package, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@findeg/ui";
import { Input } from "@findeg/ui";
import { Label } from "@findeg/ui";
import {
  updateOrderStatusAction as adminUpdateOrderStatusAction,
  updateOrderPaymentStatusAction as adminUpdateOrderPaymentStatusAction,
} from "@actions/order-actions";

import { useToast } from "@hooks/use-toast";

/**
 * OrderStatus type (local definition)
 */
type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

interface OrderPaymentFulfillmentProps {
  order: any;
}

const STATUS_FLOW: { label: string; value: OrderStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

/**
 *
 */
export function OrderPaymentFulfillment({ order }: OrderPaymentFulfillmentProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");

  /**
   *
   */
  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const result = await adminUpdateOrderStatusAction(Number(order.id), {
        status: newStatus as OrderStatus,
        trackingNumber: trackingNumber || undefined,
      });
      if (result.success) {
        toast({ title: "Order status updated" });
      } else {
        toast({ title: "Update failed", description: result.error, variant: "destructive" });
      }
    });
  };

  /**
   *
   */
  const handleUpdateTracking = () => {
    startTransition(async () => {
      const result = await adminUpdateOrderStatusAction(Number(order.id), {
        status: order.status,
        trackingNumber: trackingNumber || undefined,
      });

      if (result.success) {
        toast({ title: "Tracking information updated" });
      } else {
        toast({ title: "Update failed", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center space-y-0 gap-2">
        <CreditCard className="w-4 h-4 text-primary" />
        <CardTitle className="text-sm font-bold uppercase tracking-wider">
          Payment & Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-tight">
              Payment Status
            </span>
            <span className="font-semibold capitalize">{order.paymentStatus}</span>
          </div>
          <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
            {order.paymentStatus === "paid" ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <AlertCircle className="w-3 h-3 mr-1" />
            )}
            {order.paymentStatus}
          </Badge>
        </div>

        {/* Change Logistical Status */}
        <div className="space-y-2">
          <Label className="text-xs uppercase text-muted-foreground">Logistical Status</Label>
          <Select
            disabled={isPending || order.status === "cancelled" || order.status === "refunded"}
            onValueChange={handleStatusChange}
            defaultValue={order.status}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FLOW.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tracking Number */}
        <div className="space-y-3 pt-2 border-t text-sm">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Fulfillment Tracking</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="AWB / Tracking #"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={isPending}
              className="h-9"
            />
            <Button
              size="sm"
              onClick={handleUpdateTracking}
              disabled={isPending || !trackingNumber || trackingNumber === order.trackingNumber}
              className="h-9"
            >
              Update
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
