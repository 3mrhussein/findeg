import { describe, it, expect } from "vitest";
import type { ServiceResult } from "../ServiceResult";

describe("ServiceResult Type", () => {
  describe("Basic ServiceResult", () => {
    it("creates a successful result with data", () => {
      const result: ServiceResult<{ id: number; name: string }> = {
        success: true,
        data: { id: 1, name: "Test" },
      };

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(1);
      expect(result.data?.name).toBe("Test");
    });

    it("creates a successful result with void data", () => {
      const result: ServiceResult<void> = {
        success: true,
      };

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });
  });

  describe("Cache metadata", () => {
    it("includes cache paths for revalidation", () => {
      const result: ServiceResult<{ id: number }> = {
        success: true,
        data: { id: 1 },
        cachePaths: ["/profile", "/dashboard", "/settings"],
      };

      expect(result.cachePaths).toContain("/profile");
      expect(result.cachePaths).toHaveLength(3);
    });

    it("includes cache tags for revalidation", () => {
      const result: ServiceResult<void> = {
        success: true,
        cacheTags: ["products", "catalog", "inventory"],
      };

      expect(result.cacheTags).toContain("products");
      expect(result.cacheTags).toHaveLength(3);
    });

    it("includes both paths and tags", () => {
      const result: ServiceResult<{ productId: number }> = {
        success: true,
        data: { productId: 1 },
        cachePaths: ["/shop", "/admin/products"],
        cacheTags: ["products", "inventory"],
      };

      expect(result.cachePaths).toHaveLength(2);
      expect(result.cacheTags).toHaveLength(2);
    });
  });

  describe("Cache config for server queries", () => {
    it("includes cache config with tags and lifetime", () => {
      const result: ServiceResult<any[]> = {
        success: true,
        data: [],
        cacheConfig: {
          tags: ["products", "shop"],
          lifetime: 3600,
        },
      };

      expect(result.cacheConfig?.tags).toContain("products");
      expect(result.cacheConfig?.lifetime).toBe(3600);
    });

    it("supports different lifetimes", () => {
      const shortLived: ServiceResult<void> = {
        success: true,
        cacheConfig: {
          tags: ["orders"],
          lifetime: 60, // 1 minute
        },
      };

      const longLived: ServiceResult<void> = {
        success: true,
        cacheConfig: {
          tags: ["products"],
          lifetime: 86400, // 24 hours
        },
      };

      expect(shortLived.cacheConfig?.lifetime).toBe(60);
      expect(longLived.cacheConfig?.lifetime).toBe(86400);
    });
  });

  describe("Real-world examples", () => {
    it("handles user creation with cache invalidation", () => {
      interface User {
        id: string;
        email: string;
      }

      const result: ServiceResult<User> = {
        success: true,
        data: {
          id: "user-123",
          email: "user@example.com",
        },
        cachePaths: ["/admin/users"],
        cacheTags: ["users"],
      };

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe("user@example.com");
      expect(result.cacheTags).toContain("users");
    });

    it("handles product update with multiple cache invalidations", () => {
      interface Product {
        id: number;
        name: string;
      }

      const result: ServiceResult<Product> = {
        success: true,
        data: { id: 1, name: "Updated Product" },
        cachePaths: ["/shop", "/admin/products", "/admin/products/1"],
        cacheTags: ["products", "catalog"],
      };

      expect(result.cachePaths?.length).toBe(3);
      expect(result.cacheTags?.length).toBe(2);
    });

    it("handles query result with cache config", () => {
      interface ProductResult {
        products: Array<{ id: number; name: string }>;
        total: number;
      }

      const result: ServiceResult<ProductResult> = {
        success: true,
        data: {
          products: [{ id: 1, name: "Product" }],
          total: 1,
        },
        cacheConfig: {
          tags: ["products", "shop"],
          lifetime: 3600,
        },
      };

      expect(result.data?.total).toBe(1);
      expect(result.cacheConfig?.lifetime).toBe(3600);
    });

    it("handles operation with no cache impact", () => {
      const result: ServiceResult<{ success: boolean }> = {
        success: true,
        data: { success: true },
      };

      expect(result.cachePaths).toBeUndefined();
      expect(result.cacheTags).toBeUndefined();
      expect(result.cacheConfig).toBeUndefined();
    });
  });

  describe("Type safety", () => {
    it("enforces success always true", () => {
      // This would fail TypeScript compilation if trying to set success: false
      const result: ServiceResult<string> = {
        success: true,
        data: "test",
      };

      expect(result.success).toBe(true);
    });

    it("allows optional data fields", () => {
      const resultWithData: ServiceResult<number> = {
        success: true,
        data: 42,
      };

      const resultWithoutData: ServiceResult<void> = {
        success: true,
      };

      expect(resultWithData.data).toBe(42);
      expect(resultWithoutData.data).toBeUndefined();
    });
  });
});
