import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderDetailControls } from "@/components/admin/orders/order-detail-controls";
import { OrderAuditTimeline } from "@/components/admin/orders/order-audit-timeline";
import { container } from "@/features/core/infrastructure/di/ServiceContainer";

interface OrderDetailPageProps {
  params: Promise<{
    id: string; // URL params are usually strings
  }>;
}

/**
 *
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);

  if (isNaN(id)) {
    return notFound();
  }

  const [order, orderAuditLogs] = await Promise.all([
    container.adminOrderService.getById(id),
    container.auditLogService.getEntityLogs("order", String(id)),
  ]);

  if (!order) {
    return notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Order #{order.id}</h2>
        <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <OrderDetailControls
          orderId={order.id}
          initialStatus={order.status}
          initialPaymentStatus={order.paymentStatus}
          initialTrackingNumber={order.trackingNumber}
          initialAdminNotes={order.adminNotes}
        />

        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1">
              <span className="font-semibold">{order.customerName}</span>
              {/* Add email/phone if available in Order entity */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between py-1">
              <span>Total</span>
              <span className="font-bold">
                {order.currency} {order.total}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tracking</span>
              <span className="font-medium">{order.trackingNumber || "-"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Payment</span>
              <span className="font-medium">{order.paymentStatus || "-"}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Date: {order.date ? new Date(order.date).toLocaleDateString() : "-"}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address - Add if available in entity */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {/* Product Image if available */}
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="font-medium">
                  {order.currency} {item.price}
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-end font-bold">
            Total: {order.currency} {order.total}
          </div>
        </CardContent>
      </Card>

      <OrderAuditTimeline orderId={order.id} logs={orderAuditLogs} />
    </div>
  );
}
