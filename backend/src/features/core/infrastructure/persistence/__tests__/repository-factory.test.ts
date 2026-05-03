/**
 * Repository Factory Unit Tests
 *
 * Tests repository factory singleton pattern
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the repository implementations before importing factory
vi.mock(
  '@findeg/backend/features/identity/infrastructure/persistence/DrizzleUserRepository',
  () => ({
    DrizzleUserRepository: vi.fn().mockImplementation(() => ({
      getById: vi.fn(),
      getByEmail: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      getAuthorizationContext: vi.fn(),
    })),
  }),
);

vi.mock(
  '@findeg/backend/features/catalog/infrastructure/persistence/DrizzleProductRepository',
  () => ({
    DrizzleProductRepository: vi.fn().mockImplementation(() => ({
      getById: vi.fn(),
      getBySlug: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    })),
  }),
);

vi.mock(
  '@findeg/backend/features/catalog/infrastructure/persistence/DrizzleCategoryRepository',
  () => ({
    DrizzleCategoryRepository: vi.fn().mockImplementation(() => ({
      getById: vi.fn(),
      getBySlug: vi.fn(),
      findMany: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  }),
);

vi.mock('@findeg/backend/features/order/infrastructure/persistence/DrizzleOrderRepository', () => ({
  DrizzleOrderRepository: vi.fn().mockImplementation(() => ({
    getById: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  })),
}));

import {
  getUserRepository,
  getProductRepository,
  getCategoryRepository,
  getOrderRepository,
  resetRepositories,
} from '../repository-factory';

describe('Repository Factory', () => {
  beforeEach(() => {
    // Reset singletons before each test
    resetRepositories();
  });

  describe('getUserRepository', () => {
    it('should return a UserRepository instance', () => {
      const repo = getUserRepository();
      expect(repo).toBeDefined();
      expect(repo.getById).toBeDefined();
      expect(repo.getByEmail).toBeDefined();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const repo1 = getUserRepository();
      const repo2 = getUserRepository();
      expect(repo1).toBe(repo2);
    });

    it('should return new instance after reset', () => {
      const repo1 = getUserRepository();
      resetRepositories();
      const repo2 = getUserRepository();
      expect(repo1).not.toBe(repo2);
    });
  });

  describe('getProductRepository', () => {
    it('should return a ProductRepository instance', () => {
      const repo = getProductRepository();
      expect(repo).toBeDefined();
      expect(repo.getById).toBeDefined();
      expect(repo.getBySlug).toBeDefined();
    });

    it('should return the same instance on multiple calls', () => {
      const repo1 = getProductRepository();
      const repo2 = getProductRepository();
      expect(repo1).toBe(repo2);
    });
  });

  describe('getCategoryRepository', () => {
    it('should return a CategoryRepository instance', () => {
      const repo = getCategoryRepository();
      expect(repo).toBeDefined();
      expect(repo.getById).toBeDefined();
      expect(repo.getAll).toBeDefined();
    });

    it('should return the same instance on multiple calls', () => {
      const repo1 = getCategoryRepository();
      const repo2 = getCategoryRepository();
      expect(repo1).toBe(repo2);
    });
  });

  describe('getOrderRepository', () => {
    it('should return an OrderRepository instance', () => {
      const repo = getOrderRepository();
      expect(repo).toBeDefined();
      expect(repo.getById).toBeDefined();
      expect(repo.create).toBeDefined();
    });

    it('should return the same instance on multiple calls', () => {
      const repo1 = getOrderRepository();
      const repo2 = getOrderRepository();
      expect(repo1).toBe(repo2);
    });
  });

  describe('resetRepositories', () => {
    it('should reset all repository singletons', () => {
      const userRepo1 = getUserRepository();
      const productRepo1 = getProductRepository();
      const categoryRepo1 = getCategoryRepository();
      const orderRepo1 = getOrderRepository();

      resetRepositories();

      const userRepo2 = getUserRepository();
      const productRepo2 = getProductRepository();
      const categoryRepo2 = getCategoryRepository();
      const orderRepo2 = getOrderRepository();

      expect(userRepo1).not.toBe(userRepo2);
      expect(productRepo1).not.toBe(productRepo2);
      expect(categoryRepo1).not.toBe(categoryRepo2);
      expect(orderRepo1).not.toBe(orderRepo2);
    });
  });
});
