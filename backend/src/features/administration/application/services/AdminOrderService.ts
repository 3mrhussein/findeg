// Temporary compatibility adapter; Dashboard migrates in #367, removal in #368.
import {
  createOrders,
  type OrderStaffActor,
  type OrderStatusUpdate,
  type OrderFilters,
  type PaymentStatus,
} from '@findeg/orders';
import { fromPiasters } from '@findeg/money';
import { toLegacyOrder } from '@findeg/backend/features/order';
import type { IAdminOrderService } from '../interfaces/IAdminOrderService';
export class AdminOrderService implements IAdminOrderService {
  private orders = createOrders();
  async getAll(filters: OrderFilters) {
    const result = await this.orders.list(filters);
    return { orders: result.orders.map(toLegacyOrder), total: result.total };
  }
  async getById(id: number) {
    const order = await this.orders.get(id);
    return order ? toLegacyOrder(order) : null;
  }
  async getDetail(id: number) {
    const detail = await this.orders.detail(id);
    return detail ? { ...detail, order: toLegacyOrder(detail.order) } : null;
  }
  async updateStatus(actor: OrderStaffActor, id: number, update: OrderStatusUpdate) {
    await this.orders.changeStatus(actor, id, update);
  }
  async updatePaymentStatus(actor: OrderStaffActor, id: number, status: PaymentStatus) {
    await this.orders.changePaymentStatus(actor, id, status);
  }
  async getDashboardStats() {
    const stats = await this.orders.getStats();
    return { totalRevenue: fromPiasters(stats.totalRevenue), ordersByStatus: stats.ordersByStatus };
  }
  async getStatusCounts() {
    return (await this.orders.getStats()).ordersByStatus;
  }
}
