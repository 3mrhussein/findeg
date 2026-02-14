/**
 * Domain Entity: Order
 */

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  priceAtTime?: number;
  price?: number;
  variantDetails?: string;
  productName?: string;
}

export interface Order {
  id: number | string;
  userId?: number;
  status: string;
  totalAmount?: number;
  currency?: string;
  shippingAddress?: string;
  billingAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
  items?: OrderItem[];
  // Presentation-friendly aliases
  customerName?: string;
  date?: string;
  total?: number;
}
