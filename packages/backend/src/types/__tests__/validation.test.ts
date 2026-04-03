/**
 * Validation Schemas Unit Tests
 * 
 * Tests Zod schema validation for all domain models.
 */

import { describe, it, expect } from 'vitest';
import {
  CreateUserSchema,
  UpdateUserSchema,
  CreateProductSchema,
  UpdateProductSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateOrderSchema,
  UpdateOrderSchema,
  OrderStatusSchema,
} from '../validation';

describe('User Validation Schemas', () => {
  describe('CreateUserSchema', () => {
    it('should validate valid user input', () => {
      const validData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        roles: ['customer'],
      };

      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'password123',
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'short',
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should default roles to customer', () => {
      const data = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const result = CreateUserSchema.parse(data);
      expect(result.roles).toEqual(['customer']);
    });
  });

  describe('UpdateUserSchema', () => {
    it('should allow partial updates', () => {
      const validData = { name: 'New Name' };
      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Product Validation Schemas', () => {
  describe('CreateProductSchema', () => {
    it('should validate valid product input', () => {
      const validData = {
        nameEn: 'Test Product',
        nameAr: 'منتج تجريبي',
        slug: 'test-product',
        price: 99.99,
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        stock: 10,
        isActive: true,
        isFeatured: false,
        images: [],
        tags: [],
      };

      const result = CreateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
      const invalidData = {
        nameEn: 'Test Product',
        nameAr: 'منتج تجريبي',
        slug: 'test-product',
        price: -10,
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid slug format', () => {
      const invalidData = {
        nameEn: 'Test Product',
        nameAr: 'منتج تجريبي',
        slug: 'Invalid Slug!',
        price: 99.99,
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should default stock to 0', () => {
      const data = {
        nameEn: 'Test Product',
        nameAr: 'منتج تجريبي',
        slug: 'test-product',
        price: 99.99,
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = CreateProductSchema.parse(data);
      expect(result.stock).toBe(0);
    });
  });
});

describe('Category Validation Schemas', () => {
  describe('CreateCategorySchema', () => {
    it('should validate valid category input', () => {
      const validData = {
        nameEn: 'Electronics',
        nameAr: 'إلكترونيات',
        slug: 'electronics',
        displayOrder: 1,
        isActive: true,
      };

      const result = CreateCategorySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow null parent ID', () => {
      const data = {
        nameEn: 'Root Category',
        nameAr: 'فئة جذرية',
        slug: 'root',
        parentId: null,
      };

      const result = CreateCategorySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Order Validation Schemas', () => {
  describe('CreateOrderSchema', () => {
    it('should validate valid order input', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'pending' as const,
        items: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174001',
            productName: 'Test Product',
            variantId: null,
            quantity: 2,
            unitPrice: 50,
            totalPrice: 100,
          },
        ],
        subtotal: 100,
        tax: 10,
        shipping: 5,
        total: 115,
        shippingAddress: '123 Main St, City, Country',
        billingAddress: '123 Main St, City, Country',
        paymentMethod: 'credit_card',
      };

      const result = CreateOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject order with no items', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        items: [],
        subtotal: 0,
        total: 0,
        shippingAddress: '123 Main St',
        billingAddress: '123 Main St',
        paymentMethod: 'credit_card',
      };

      const result = CreateOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('OrderStatusSchema', () => {
    it('should validate valid statuses', () => {
      const validStatuses = [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ];

      validStatuses.forEach((status) => {
        const result = OrderStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const result = OrderStatusSchema.safeParse('invalid-status');
      expect(result.success).toBe(false);
    });
  });
});
