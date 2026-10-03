import { INotificationService } from '../interfaces/INotificationService';

/**
 * Notification Event Service
 * Central dispatcher to connect domain events to Notifications and Emails.
 */
export class NotificationEventService {
  /**
   *
   */
  constructor(private notificationService: INotificationService) {}

  /**
   * Low Stock Alert (Admin only)
   */
  async onLowStock(adminId: number, product: { name: string; sku: string }) {
    await this.notificationService.create({
      userId: adminId,
      type: 'inventory.low_stock',
      titleEn: `Low stock alert: ${product.name}`,
      titleAr: `تنبيه انخفاض المخزون: ${product.name}`,
      bodyEn: `SKU ${product.sku} is running low.`,
      bodyAr: `المنتج ${product.sku} على وشك النفاد.`,
      actionUrl: '/admin/inventory',
    });
  }
}
