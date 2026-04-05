"use client";

import { useTransition } from "react";
import { type Order } from "@/features/order/domain/entities/Order";
import { Button } from "@findeg/ui";
import { Badge } from "@findeg/ui";
import { Printer, RefreshCcw } from "lucide-react";
import { adminUpdateOrderStatusAction } from "@/features/administration/application/actions/admin-order-actions";
import { useToast } from "@/hooks/use-toast";

interface OrderHeaderProps {
  order: Order;
}

/**
 *
 */
export function OrderHeader({ order }: OrderHeaderProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  /**
   *
   */
  const handleRefund = () => {
    // Basic wrapper to prompt refund or directly refund (could open RefundDialog)
    startTransition(async () => {
      const result = await adminUpdateOrderStatusAction(order.id, {
        status: "refunded",
        adminNotes: "Refunded via admin",
      });
      if (result.success) {
        toast({ title: "Order refunded successfully" });
      } else {
        toast({ title: "Refund failed", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          Order #FE-{String(order.id).padStart(5, "0")}
          <Badge variant="secondary" className="text-sm px-3 py-1 uppercase tracking-wider">
            {order.status}
          </Badge>
        </h1>
        <p className="text-muted-foreground mt-1">
          Placed on {new Date(order.createdAt!).toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <a href={`/admin/orders/${order.id}?view=invoice`} target="_blank" rel="noreferrer">
            <Printer className="mr-2 h-4 w-4" />
            Print Packing Slip
          </a>
        </Button>
        {order.paymentStatus === "paid" && order.status !== "refunded" && (
          <Button variant="destructive" size="sm" onClick={handleRefund} disabled={isPending}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Process Refund
          </Button>
        )}
      </div>
    </div>
  );
}
