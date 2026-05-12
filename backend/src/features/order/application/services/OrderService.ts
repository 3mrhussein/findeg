import { type ID } from '@findeg/backend/features/core/domain/types/common';
import { type Order } from '../../domain/entities/Order';
import { orderQueries, type OrderRow, type OrderItemRow } from '@findeg/db/queries';
import { ShippingAddress } from '../../domain/value-objects';

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
  constructor() { }

  private mapToDomain(
    dbOrder: OrderRow,
    items: OrderItemRow[],
  ): Order {
    return {
      id: dbOrder.id,
      userId: dbOrder.userId || undefined,
      guestEmail: dbOrder.guestEmail || undefined,
      status: dbOrder.status,
      paymentStatus: dbOrder.paymentStatus,
      subtotal: Number(dbOrder.subtotal),
      shippingCost: Number(dbOrder.shippingCost),
      totalAmount: Number(dbOrder.totalAmount),
      currency: dbOrder.currency,
      paymentMethod: dbOrder.paymentMethod || undefined,
      shippingAddressSnapshot: (dbOrder.shippingAddressSnapshot as ShippingAddress) || undefined,
      trackingNumber: dbOrder.trackingNumber || undefined,
      adminNotes: dbOrder.adminNotes || undefined,
      createdAt: dbOrder.createdAt,
      updatedAt: dbOrder.updatedAt,
      customerName: dbOrder.customerName,
      customerEmail: dbOrder.customerEmail,
      items: items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId!,
        variantId: ((item as Record<string, unknown>).variantId as number) || undefined,
        quantity: item.quantity,
        uomCode: ((item as Record<string, unknown>).uomCode as string) || undefined,
        unitPriceSnapshot: item.unitPriceSnapshot
          ? Number(item.unitPriceSnapshot)
          : undefined,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : undefined,
        productNameSnapshot: item.productNameSnapshot || undefined,
        productSkuSnapshot: item.productSkuSnapshot || undefined,
        variantSnapshot: (item.variantSnapshot as Record<string, unknown>) || undefined,
      })),
    };
  }

  async getAll(filters?: any): Promise<{ orders: Order[]; total: number }> {
    const result = await orderQueries.getFiltered(filters || {});
    return {
      orders: result.orders.map((row) => this.mapToDomain(row.order, row.items)),
      total: result.total,
    };
  }

  async getById(id: ID | string): Promise<Order | null> {
    const result = await orderQueries.getById(id);
    if (!result) return null;
    return this.mapToDomain(result.order, result.items);
  }

  async getByUserId(userId: ID): Promise<Order[]> {
    const results = await orderQueries.getByUserId(userId);
    return results.map((row) => this.mapToDomain(row.order, row.items));
  }

  async getRecent(limit?: number): Promise<Order[]> {
    const results = await orderQueries.getRecent(limit);
    return results.map((row) => this.mapToDomain(row.order, row.items));
  }

  async count(filters?: any): Promise<number> {
    return orderQueries.count(filters);
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
    const orders = await this.getByUserId(userId);

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
