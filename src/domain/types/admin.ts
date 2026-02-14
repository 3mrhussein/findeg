/**
 * Domain Types: Admin
 *
 * Admin-specific DTOs and types used across all layers.
 * These are pure data structures with no dependencies.
 */

/** Dashboard statistics aggregate */
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalBrands: number;
  totalRevenue: number;
  currency: string;
  lowStockCount: number;
  todayRevenue: number;
  todayOrders: number;
  topProducts: {
    id: number;
    name: string;
    sold: number;
    revenue: number;
  }[];
  revenueByPeriod: {
    date: string;
    revenue: number;
  }[];
}

/** Input for creating/updating a product */
export interface AdminProductInput {
  sku?: string;
  price: number;
  strikePrice?: number;
  /** FK ID for category */
  categoryId?: number;
  /** Legacy text category (optional transition) */
  category?: string;
  brandId?: number;
  images?: string[];
  isActive?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  isNew?: boolean;
  variants?: Record<string, any>;
  translations: {
    language: string;
    name: string;
    description: string;
    longDescription: string;
  }[];
}

/** Input for creating/updating a category */
export interface AdminCategoryInput {
  slug: string;
  parentId?: number;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  translations: {
    language: string;
    name: string;
    description?: string;
  }[];
}

/** Input for creating/updating a brand */
export interface AdminBrandInput {
  slug: string;
  name: string;
  logoUrl?: string;
  isActive?: boolean;
}

/** Input for updating order status */
export interface AdminOrderStatusUpdate {
  status: string;
  trackingNumber?: string;
  adminNotes?: string;
}

/** Input for inventory updates */
export interface AdminInventoryUpdate {
  productId: number;
  quantity: number;
  lowStockThreshold?: number;
}

/** Credentials for admin login */
export interface AuthCredentials {
  email: string;
  password: string;
}

/** Result of an authentication attempt */
export interface AuthResult {
  success: boolean;
  error?: string;
  user?: {
    id: number;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: string;
  };
}

/** Session payload stored in JWT */
export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
}

/** User with password hash — only for auth verification */
export interface UserWithPassword {
  id: number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  password: string | null;
}
