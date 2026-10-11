import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '@findeg/db/schema';
import type {
  OrderStatus,
  PaymentStatus,
  ShippingAddress,
  VariantSnapshot,
} from '@findeg/db/types';
import type { OrderStatusUpdate } from './schemas';
import type { OrderStaffActor } from './OrderStaffActor';
import type { OrderStatusTransitionResult, PaymentStatusTransitionResult } from './errors';
export type OrderDatabase = PostgresJsDatabase<typeof schema>;
export interface OrdersDependencies {
  db?: OrderDatabase;
  now?: () => Date;
}
export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  variantId: number | null;
  quantity: number;
  uomCode: string | null;
  unitPrice: bigint;
  discountAmount: bigint;
  lineTotal: bigint;
  productNameSnapshot: string | null;
  productSkuSnapshot: string | null;
  variantSkuSnapshot: string | null;
  variantSnapshot: VariantSnapshot | null;
}
export interface Order {
  id: number;
  orderReference: string;
  userId: number | null;
  guestEmail: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: bigint;
  shippingCost: bigint;
  discountTotal: bigint;
  totalAmount: bigint;
  currency: string;
  paymentMethod: 'cod' | 'card' | null;
  shippingAddressSnapshot: ShippingAddress | null;
  trackingNumber: string | null;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerName: string;
  customerEmail: string | null;
  items: OrderItem[];
}
export interface OrderActivityEntry {
  id: number;
  action: string;
  adminId?: number;
  adminName?: string;
  oldValue?: string;
  newValue?: string;
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  createdAt: Date;
}
export interface OrderDetail {
  order: Order;
  activity: OrderActivityEntry[];
}
export interface OrderStatsOptions {
  from?: string;
  to?: string;
  trendDays?: number;
  topProductsLimit?: number;
}
export interface OrderStats {
  currency: 'EGP';
  timezone: 'Africa/Cairo';
  totalOrders: number;
  totalRevenue: bigint;
  todayOrders: number;
  todayRevenue: bigint;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByPeriod: { date: string; revenue: bigint }[];
  topProducts: { id: number; name: string; sold: number; revenue: bigint }[];
}
export interface Orders {
  get(id: number | string): Promise<Order | null>;
  list(filters?: OrderFilters): Promise<{ orders: Order[]; total: number }>;
  listForCustomer(userId: number): Promise<Order[]>;
  recent(limit?: number): Promise<Order[]>;
  detail(id: number | string): Promise<OrderDetail | null>;
  latestShippingAddress(userId: number): Promise<ShippingAddress | null>;
  getStats(options?: OrderStatsOptions): Promise<OrderStats>;
  changeStatus(
    actor: OrderStaffActor,
    id: number,
    update: OrderStatusUpdate,
  ): Promise<OrderStatusTransitionResult>;
  changePaymentStatus(
    actor: OrderStaffActor,
    id: number,
    status: PaymentStatus,
  ): Promise<PaymentStatusTransitionResult>;
}
