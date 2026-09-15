import type { ID } from '../../../core/domain/types/common';
import type { Order } from '../../domain/entities/Order';
import type { OrderFilters } from './IOrderRepository';

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


export interface IOrderService {
  getAll(filters?: OrderFilters): Promise<{ orders: Order[]; total: number }>;
  getById(id: ID | string): Promise<Order | null>;
  getByUserId(userId: ID): Promise<Order[]>;
  getRecent(limit?: number): Promise<Order[]>;
  count(filters?: OrderFilters): Promise<number>;
  getCheckoutPrefill(
    userId: ID,
    userProfile: { email: string; firstName?: string; lastName?: string; phone?: string },
  ): Promise<CheckoutPrefillData>;
}
