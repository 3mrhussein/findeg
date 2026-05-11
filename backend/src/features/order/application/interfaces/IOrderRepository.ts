import {
  ID,
  OrderStatus,
  PaymentStatus,
} from '@findeg/backend/features/core/domain/types/common';
import { Order } from '../../domain/entities/Order';
import { OrderStatusUpdate } from '../../../administration/application/dtos/OrderStatusUpdate';

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: ID;
  startDate?: Date;
  endDate?: Date;
  search?: string; // Search by ID, customer name, email
  limit?: number;
  offset?: number;
}

export interface IOrderRepository {
  getById(id: ID | string): Promise<Order | null>;
  getByUserId(userId: ID): Promise<Order[]>;
  hasPurchasedProduct(userId: ID, productId: ID): Promise<boolean>;
  getAllFiltered(filters: OrderFilters): Promise<{ orders: Order[]; total: number }>;

  create(order: Partial<Order>): Promise<Order>;
  updateStatus(id: ID | string, status: OrderStatus): Promise<void>;
  updateStatusWithTracking(id: ID | string, update: OrderStatusUpdate): Promise<void>;
  updatePaymentStatus(id: ID | string, status: PaymentStatus): Promise<void>;

  getRecent(limit?: number): Promise<Order[]>;
  count(filters?: OrderFilters): Promise<number>;
  getOrdersCountByStatus(): Promise<Partial<Record<OrderStatus, number>>>;

  // Analytics
  getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number>;
  getRevenueByPeriod(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'month',
  ): Promise<{ date: string; revenue: number }[]>;
}
