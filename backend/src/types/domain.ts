/**
 * Domain Types
 *
 * Core domain models representing business entities.
 * These types define the shape of data throughout the application.
 */

export type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  categoryId: string;
  brandId: string | null;
  stock: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryTree = Category & {
  children: CategoryTree[];
};

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
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};
