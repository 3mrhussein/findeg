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
  totalRevenue: number;
  currency: string;
}

/** Input for creating/updating a product */
export interface AdminProductInput {
  price: number;
  strikePrice?: number;
  category: string;
  images?: string[];
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
  translations: {
    language: string;
    name: string;
    description?: string;
  }[];
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
  role: string;
  password: string | null;
}
