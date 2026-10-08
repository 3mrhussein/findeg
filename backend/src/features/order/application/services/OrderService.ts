// Compatibility API for existing callers; removed by #368.
import { createOrders } from '@findeg/orders';
import type { IOrderService } from '../interfaces/IOrderService';
import type { OrderFilters } from '../interfaces/IOrderRepository';
import { toLegacyOrder } from '../../legacy';
export class OrderService implements IOrderService {
  private orders = createOrders();
  async getAll(filters?: OrderFilters) {
    const result = await this.orders.list(filters);
    return { orders: result.orders.map(toLegacyOrder), total: result.total };
  }
  async getById(id: number | string) {
    const order = await this.orders.get(id);
    return order ? toLegacyOrder(order) : null;
  }
  async getByIdForUser(userId: number, id: number | string) {
    const order = await this.orders.get(id);
    return order?.userId === userId ? toLegacyOrder(order) : null;
  }
  async getByUserId(userId: number) {
    return (await this.orders.listForCustomer(userId)).map(toLegacyOrder);
  }
  async getRecent(limit?: number) {
    return (await this.orders.recent(limit)).map(toLegacyOrder);
  }
  async count(filters?: OrderFilters) {
    return (await this.orders.list({ ...filters, limit: 1 })).total;
  }
  async getCheckoutPrefill(
    userId: number,
    profile: { email: string; firstName?: string; lastName?: string; phone?: string },
  ) {
    const address = await this.orders.latestShippingAddress(userId);
    return {
      fullName:
        [profile.firstName, profile.lastName].filter(Boolean).join(' ') || address?.fullName || '',
      guestEmail: profile.email || '',
      phone: profile.phone || address?.phone || '',
      city: address?.city || '',
      area: address?.area || '',
      street: address?.street || '',
      building: address?.building || '',
      floor: address?.floor || '',
      apartment: address?.apartment || '',
      notes: address?.notes || '',
    };
  }
}
