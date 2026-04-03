/**
 * Backend Package Exports Verification Test
 * 
 * Verifies that all public exports can be imported correctly.
 * Run with: pnpm --filter @findeg/backend test exports
 */

import { describe, it, expect } from 'vitest';

describe('Backend Package Exports', () => {
  it('should load repository contract interfaces module', async () => {
    // Interfaces are TypeScript-only and don't exist at runtime
    // Just verify the module loads without errors
    const module = await import('@/features/core/infrastructure/persistence/contracts');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });

  it('should export JWT service', async () => {
    const { JWTService, createJWTService } = 
      await import('@/features/identity/application/services/JWTService');
    
    expect(JWTService).toBeDefined();
    expect(createJWTService).toBeDefined();
  });

  it('should export error classes', async () => {
    const {
      AppError,
      UnauthorizedError,
      ForbiddenError,
      NotFoundError,
      ValidationError,
      ConflictError,
      InternalServerError,
    } = await import('@/lib/errors');
    
    expect(AppError).toBeDefined();
    expect(UnauthorizedError).toBeDefined();
    expect(ForbiddenError).toBeDefined();
    expect(NotFoundError).toBeDefined();
    expect(ValidationError).toBeDefined();
    expect(ConflictError).toBeDefined();
    expect(InternalServerError).toBeDefined();
  });

  it('should export i18n utilities', async () => {
    const {
      formatCurrency,
      formatDate,
      formatDateTime,
      formatRelativeTime,
      formatNumber,
    } = await import('@/lib/i18n');
    
    expect(formatCurrency).toBeDefined();
    expect(formatDate).toBeDefined();
    expect(formatDateTime).toBeDefined();
    expect(formatRelativeTime).toBeDefined();
    expect(formatNumber).toBeDefined();
  });

  it('should export validation schemas', async () => {
    const {
      CreateUserSchema,
      UpdateUserSchema,
      CreateProductSchema,
      UpdateProductSchema,
      CreateCategorySchema,
      UpdateCategorySchema,
      CreateOrderSchema,
      UpdateOrderSchema,
      OrderStatusSchema,
    } = await import('@/types/validation');
    
    expect(CreateUserSchema).toBeDefined();
    expect(UpdateUserSchema).toBeDefined();
    expect(CreateProductSchema).toBeDefined();
    expect(UpdateProductSchema).toBeDefined();
    expect(CreateCategorySchema).toBeDefined();
    expect(UpdateCategorySchema).toBeDefined();
    expect(CreateOrderSchema).toBeDefined();
    expect(UpdateOrderSchema).toBeDefined();
    expect(OrderStatusSchema).toBeDefined();
  });

  it('should export domain types', async () => {
    const module = await import('@/types/domain');
    
    // Type exports don't exist at runtime, but the module should load
    expect(module).toBeDefined();
  });

  it('should create JWT service instance', async () => {
    const { JWTService } = await import('@/features/identity/application/services/JWTService');
    
    // Should throw without secrets in test environment
    expect(() => new JWTService()).toThrow('JWT secrets are required');
    
    // Should work with provided secrets
    const service = new JWTService('test-secret-32-chars-minimum!!', 'test-refresh-secret-32-chars-min!');
    expect(service).toBeInstanceOf(JWTService);
  });

  it('should create error instances', async () => {
    const {
      UnauthorizedError,
      NotFoundError,
      ValidationError,
    } = await import('@/lib/errors');
    
    const authError = new UnauthorizedError('Invalid token');
    expect(authError).toBeInstanceOf(UnauthorizedError);
    expect(authError.statusCode).toBe(401);
    expect(authError.message).toBe('Invalid token');
    
    const notFoundError = new NotFoundError('Resource not found');
    expect(notFoundError.statusCode).toBe(404);
    
    const validationError = new ValidationError('Invalid input', {
      email: ['Invalid email format'],
    });
    expect(validationError.statusCode).toBe(400);
    expect(validationError.errors).toEqual({ email: ['Invalid email format'] });
  });

  it('should validate schemas with correct data', async () => {
    const { CreateUserSchema, CreateProductSchema } = await import('@/types/validation');
    
    const validUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };
    const userResult = CreateUserSchema.safeParse(validUser);
    expect(userResult.success).toBe(true);
    
    const validProduct = {
      nameEn: 'Test Product',
      nameAr: 'منتج تجريبي',
      slug: 'test-product',
      price: 99.99,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
    };
    const productResult = CreateProductSchema.safeParse(validProduct);
    expect(productResult.success).toBe(true);
  });
});
