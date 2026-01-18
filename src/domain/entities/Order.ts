/**
 * Domain Entity: Order
 */

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  priceAtTime: number;
  variantDetails?: string;
}

export interface Order {
  id: number;
  userId?: number;
  status: string;
  totalAmount: number;
  currency: string;
  shippingAddress?: string;
  billingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}
