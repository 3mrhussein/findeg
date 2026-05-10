import { type ID } from '@findeg/backend/features/core/domain/types/common';
import { type IOrderRepository, type OrderFilters } from '../interfaces/IOrderRepository';
import { type Order } from '../../domain/entities/Order';

export interface CheckoutPrefillData {
  fullName: string;
  guestEmail: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  notes: string;
}

/**
 * Order Service - Pure TypeScript
 *
 * Provides order query and retrieval functionality.
 * For admin operations (status updates), use AdminOrderService from administration feature.
 */
export class OrderService {
  constructor(private orderRepository: IOrderRepository) {}

  async getAll(filters?: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    return this.orderRepository.getAllFiltered(filters || {});
  }

  async getById(id: ID | string): Promise<Order | null> {
    return this.orderRepository.getById(id);
  }

  async getByUserId(userId: ID): Promise<Order[]> {
    return this.orderRepository.getByUserId(userId);
  }

  async getRecent(limit?: number): Promise<Order[]> {
    return this.orderRepository.getRecent(limit);
  }

  async count(filters?: OrderFilters): Promise<number> {
    return this.orderRepository.count(filters);
  }

  /**
   * Retrieves checkout prefill data based on the user's most recent order history.
   *
   * @param userId - ID of the user
   * @param userProfile - Basic user profile info (email, names) to default to
   */
  async getCheckoutPrefill(
    userId: ID,
    userProfile: { email: string; firstName?: string; lastName?: string; phone?: string },
  ) {
    const orders = await this.orderRepository.getByUserId(userId);

    // Sort orders by date descending to find the latest with an address
    const latestOrder = orders
      .filter((o) => o.shippingAddressSnapshot)
      .sort((a, b) => {
        const timeA = a.createdAt?.getTime() || 0;
        const timeB = b.createdAt?.getTime() || 0;
        return timeB - timeA;
      })[0];

    const address = latestOrder?.shippingAddressSnapshot;
    const fullName = [userProfile.firstName, userProfile.lastName].filter(Boolean).join(' ');

    return {
      fullName: fullName || address?.fullName || '',
      guestEmail: userProfile.email || '',
      phone: userProfile.phone || address?.phone || '',
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
