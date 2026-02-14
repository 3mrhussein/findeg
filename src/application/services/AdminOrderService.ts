import { IAdminOrderService } from "@/application/services/interfaces/IAdminOrderService";
import { IOrderRepository, OrderFilters } from "@/application/repositories/IOrderRepository";
import { IAuditLogService } from "@/application/services/interfaces/IAuditLogService";
import { Order } from "@/domain/entities/Order";
import { AdminOrderStatusUpdate } from "@/domain/types/admin";

/**
 * Admin Order Service
 *
 * Manages order lifecycle and status updates for admin dashboard.
 * Handles order tracking, payment status, and audit logging.
 */
export class AdminOrderService implements IAdminOrderService {
  /**
   * Creates an instance of AdminOrderService
   *
   * @param orderRepository - Order data access layer
   * @param auditLogService - Audit logging service for tracking order changes
   */
  constructor(
    private orderRepository: IOrderRepository,
    private auditLogService: IAuditLogService,
  ) {}

  /**
   * Retrieves all orders with optional filtering
   *
   * @param filters - Order filters (status, date range, pagination)
   * @returns Paginated order list with total count
   */
  async getAll(filters: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    return this.orderRepository.getAllFiltered(filters);
  }

  /**
   * Retrieves a single order by ID
   *
   * @param id - Order ID
   * @returns Order entity or null if not found
   */
  async getById(id: number): Promise<Order | null> {
    return this.orderRepository.getById(id);
  }

  /**
   * Updates order status and tracking information
   *
   * Logs the status change to the audit trail.
   *
   * @param id - Order ID to update
   * @param update - Status update with tracking number and admin notes
   * @throws Error if order not found
   */
  async updateStatus(id: number, update: AdminOrderStatusUpdate): Promise<void> {
    const order = await this.orderRepository.getById(id);
    if (!order) {
      throw new Error(`Order #${id} not found`);
    }

    await this.orderRepository.updateStatusWithTracking(id, update);

    await this.auditLogService.logAction({
      entityType: "order",
      entityId: String(id),
      action: "update_status",
      adminUserId: null,
      oldValues: { status: order.status } as any,
      newValues: {
        status: update.status,
        trackingNumber: update.trackingNumber,
        adminNotes: update.adminNotes,
      } as any,
    });
  }

  /**
   * Updates payment status for an order
   *
   * Logs the payment status change to the audit trail.
   *
   * @param id - Order ID
   * @param status - New payment status
   * @throws Error if order not found
   */
  async updatePaymentStatus(id: number, status: string): Promise<void> {
    const order = await this.orderRepository.getById(id);
    if (!order) {
      throw new Error(`Order #${id} not found`);
    }

    const oldStatus = order.paymentStatus;
    await this.orderRepository.updatePaymentStatus(id, status);

    // Track in audit log
    await this.auditLogService.logAction({
      entityType: "order",
      entityId: String(id),
      action: "update_payment_status",
      oldValues: { paymentStatus: oldStatus },
      newValues: { paymentStatus: status },
    });
  }

  /**
   * Retrieves order-related dashboard statistics
   *
   * @returns Statistics including total revenue and order counts by status
   */
  async getDashboardStats(): Promise<any> {
    const revenue = await this.orderRepository.getTotalRevenue();
    const statusCounts = await this.orderRepository.getOrdersCountByStatus();

    return {
      totalRevenue: revenue,
      ordersByStatus: statusCounts,
    };
  }
}
