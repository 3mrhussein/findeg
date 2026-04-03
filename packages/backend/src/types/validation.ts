/**
 * Zod Validation Schemas
 * 
 * Type-safe validation schemas for all data inputs.
 * Derived TypeScript types ensure consistency between validation and type checking.
 */

import { z } from 'zod';

// ============================================================================
// User Schemas
// ============================================================================

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  roles: z.array(z.string()).optional().default(['customer']),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  password: z.string().min(8).max(100).optional(),
  roles: z.array(z.string()).optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// ============================================================================
// Product Schemas
// ============================================================================

export const CreateProductSchema = z.object({
  nameEn: z.string().min(1, 'English name is required').max(500),
  nameAr: z.string().min(1, 'Arabic name is required').max(500),
  descriptionEn: z.string().max(5000).nullable().optional(),
  descriptionAr: z.string().max(5000).nullable().optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  price: z.number().min(0, 'Price must be non-negative'),
  compareAtPrice: z.number().min(0).nullable().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  brandId: z.string().uuid().nullable().optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative').default(0),
  sku: z.string().max(100).nullable().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// ============================================================================
// Category Schemas
// ============================================================================

export const CreateCategorySchema = z.object({
  nameEn: z.string().min(1, 'English name is required').max(255),
  nameAr: z.string().min(1, 'Arabic name is required').max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  parentId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

// ============================================================================
// Order Schemas
// ============================================================================

export const OrderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  productName: z.string().min(1).max(500),
  variantId: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  totalPrice: z.number().min(0, 'Total price must be non-negative'),
});

export const OrderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const CreateOrderSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  status: OrderStatusSchema.default('pending'),
  items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
  subtotal: z.number().min(0),
  tax: z.number().min(0).default(0),
  shipping: z.number().min(0).default(0),
  total: z.number().min(0),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  billingAddress: z.string().min(1, 'Billing address is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().max(1000).nullable().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderSchema = z.object({
  status: OrderStatusSchema.optional(),
  notes: z.string().max(1000).nullable().optional(),
  shippingAddress: z.string().min(1).optional(),
  billingAddress: z.string().min(1).optional(),
});

export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;

// ============================================================================
// Filter Schemas
// ============================================================================

export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const UserFiltersSchema = PaginationSchema.extend({
  roles: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(255).optional(),
});

export type UserFilters = z.infer<typeof UserFiltersSchema>;

export const ProductFiltersSchema = PaginationSchema.extend({
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  search: z.string().max(255).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['price', 'name', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

export const CategoryFiltersSchema = z.object({
  parentId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(255).optional(),
});

export type CategoryFilters = z.infer<typeof CategoryFiltersSchema>;

export const OrderFiltersSchema = PaginationSchema.extend({
  userId: z.string().uuid().optional(),
  status: z.union([OrderStatusSchema, z.array(OrderStatusSchema)]).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['createdAt', 'total', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type OrderFilters = z.infer<typeof OrderFiltersSchema>;
