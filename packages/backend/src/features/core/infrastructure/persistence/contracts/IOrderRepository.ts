/**
 * Order Repository Contract
 * 
 * Defines the interface for order data access operations.
 * Backend package exports this interface; frontend packages import it.
 */

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: string; // JSON string or structured address
  billingAddress: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderFilters = {
  userId?: string;
  status?: OrderStatus | OrderStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // search by order number
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
};

export type CreateOrderInput = Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>;
export type UpdateOrderInput = Partial<Pick<Order, 'status' | 'notes' | 'shippingAddress' | 'billingAddress'>>;

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findMany(filters: OrderFilters): Promise<Order[]>;
  create(data: CreateOrderInput): Promise<Order>;
  update(id: string, data: UpdateOrderInput): Promise<Order>;
  delete(id: string): Promise<void>;
  count(filters?: OrderFilters): Promise<number>;
}
