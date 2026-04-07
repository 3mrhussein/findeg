import { INotificationService } from "../interfaces/INotificationService";
import { IEmailService } from "@features/notifications/application/services/IEmailService";
import { Order } from "@features/order/domain/entities/Order";

/**
 * Notification Event Service
 * Central dispatcher to connect domain events to Notifications and Emails.
 */
export class NotificationEventService {
  /**
   *
   */
  constructor(
    private notificationService: INotificationService,
    private emailService: IEmailService,
  ) {}

  /**
   * Order Created
   */
  async onOrderCreated(
    order: Order,
    customer: {
      id: number;
      email: string;
      firstName?: string;
      lastName?: string;
      locale?: string | null;
    },
  ) {
    // 1. In-app for customer
    await this.notificationService.create({
      userId: customer.id,
      type: "order.created",
      titleEn: `Order #${order.id} confirmed`,
      titleAr: `تم تأكيد الطلب رقم #${order.id}`,
      bodyEn: "We've received your order and are processing it.",
      bodyAr: "لقد استلمنا طلبك وجاري العمل عليه.",
      actionUrl: `/dashboard/orders/${order.id}`,
    });

    // 2. Email for customer
    await this.emailService.sendOrderConfirmation(order, customer);

    // 3. In-app for admins (simplifying to all super admins for now if needed,
    // but usually we'd notify active operators)
    // For now we'll just handle customer notification.
  }

  /**
   * Order Status Update
   */
  async onOrderStatusUpdate(order: Order, newStatus: string) {
    if (!order.userId) return;

    await this.notificationService.create({
      userId: order.userId,
      type: "order.shipped", // or generic status update
      titleEn: `Order #${order.id} status updated: ${newStatus}`,
      titleAr: `تحديث حالة الطلب #${order.id}: ${newStatus}`,
      actionUrl: `/dashboard/orders/${order.id}`,
    });

    await this.emailService.sendOrderStatusUpdate(order, newStatus);
  }

  /**
   * School List Access Approved
   */
  async onAccessRequestApproved(
    user: {
      id: number;
      email: string;
      firstName?: string;
      lastName?: string;
      locale?: string | null;
    },
    list: { id: string; listName: string; schoolName: string; grade: string; academicYear: string },
  ) {
    await this.notificationService.create({
      userId: user.id,
      type: "access.approved",
      titleEn: `Access approved for ${list.schoolName}`,
      titleAr: `تمت الموافقة على الدخول لـ ${list.schoolName}`,
      bodyEn: `You can now view the list for ${list.grade}.`,
      bodyAr: `يمكنك الآن عرض قائمة ${list.grade}.`,
      actionUrl: `/lists/${list.id}`, // or slug
    });

    await this.emailService.sendSchoolListAccessApproved(user, list);
  }

  /**
   * Low Stock Alert (Admin only)
   */
  async onLowStock(adminId: number, product: { name: string; sku: string }) {
    await this.notificationService.create({
      userId: adminId,
      type: "inventory.low_stock",
      titleEn: `Low stock alert: ${product.name}`,
      titleAr: `تنبيه انخفاض المخزون: ${product.name}`,
      bodyEn: `SKU ${product.sku} is running low.`,
      bodyAr: `المنتج ${product.sku} على وشك النفاد.`,
      actionUrl: "/admin/inventory",
    });
  }
}
