import { DEFAULT_CURRENCY, BUSINESS_TIME_ZONE } from '@findeg/domain';
import type { OrderStatus, PaymentStatus, PaymentMethod } from '@findeg/domain/types';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '@findeg/db/schema';
import type {
  OrderStatusTransitionResult,
  PaymentStatusTransitionResult,
} from './features/order-errors';
import type { OrderStatusUpdate, ShippingAddress, VariantSnapshot } from './features/input-schemas';
import type { OrderStaffActor } from './features/write-permission';

export type OrderDatabase = PostgresJsDatabase<typeof schema>;

export interface OrdersDependencies {
  db?: OrderDatabase;
  now?: () => Date;
}

/** The injected collaborators every Order feature receives from the factory. */
export interface OrderContext {
  database: () => Promise<OrderDatabase>;
  now: () => Date;
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
  isSubstitute: boolean | null;
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
  paymentMethod: PaymentMethod | null;
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

export interface OrderNote {
  id: number;
  orderId: number;
  authorId: number | null;
  authorName: string;
  note: string;
  createdAt: Date;
}

export interface OrderDetail {
  order: Order;
  activity: OrderActivityEntry[];
  notes: OrderNote[];
}

export interface OrderStatsOptions {
  from?: string;
  to?: string;
  trendDays?: number;
  topProductsLimit?: number;
  liveOnly?: boolean;
}

export interface OrderStats {
  currency: typeof DEFAULT_CURRENCY;
  timezone: typeof BUSINESS_TIME_ZONE;
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
  refund(actor: OrderStaffActor, id: number): Promise<OrderStatusTransitionResult>;
  changePaymentStatus(
    actor: OrderStaffActor,
    id: number,
    status: PaymentStatus,
  ): Promise<PaymentStatusTransitionResult>;
  addNote(actor: OrderStaffActor, id: number | string, note: string): Promise<OrderNote>;
  listNotes(id: number | string): Promise<OrderNote[]>;
}

export type {
  CheckoutAcceptedOrder,
  CheckoutLine,
  CheckoutOrderContext,
  CheckoutOrderInput,
  CheckoutQuote,
  CheckoutQuoteLine,
  CheckoutReceipt,
  CheckoutShippingAddress,
  CheckoutValidateInput,
  ListCheckoutLine,
} from './features/checkout-input';
export type {
  CheckoutAcceptFailure,
  CheckoutAcceptResult,
  CheckoutAcceptSuccess,
  CheckoutServiceOptions,
  CheckoutValidateFailure,
  CheckoutValidateResult,
  CheckoutValidateSuccess,
  ICheckoutService,
  OutboxEnqueue,
} from './features/order-acceptance';
export type { GuestAccessTokens } from './features/guest-access-token';
export type {
  GuestAccessServiceOptions,
  GuestOrderView,
  RequestAccessResult,
  VerifyResult,
} from './features/guest-access';
export type {
  GuestAccessRequestInput,
  GuestAccessVerifyInput,
} from './features/guest-access-input';
export type * from './index';
