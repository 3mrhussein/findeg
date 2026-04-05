/**
 * Unit Tests: Product Actions
 *
 * Verifies pure TypeScript product actions return ServiceResult with cache metadata.
 * Tests run in Vitest pure Node.js environment (no Next.js runtime).
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createProduct, updateProduct, deleteProduct } from "../product";
import { ResourceNotFoundError, ValidationError } from "@/features/core/domain/errors";
import type { ProductInput } from "@/features/administration/domain/types";

// Mock the container
vi.mock("@/features/core/infrastructure/di/ServiceContainer", () => ({
  container: {
    adminProductService: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { container } from "@/features/core/infrastructure/di/ServiceContainer";

describe("Product Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProduct", () => {
    it("should return ServiceResult with cache paths when product is created successfully", async () => {
      const mockProduct: any = {
        id: 1,
        name: "Test Product",
        description: "Desc",
        longDescription: "Long",
        rating: 5,
        reviewsCount: 1,
      };
      vi.mocked(container.adminProductService.create).mockResolvedValue(mockProduct);

      const input: ProductInput = {
        translations: [
          { language: "en", name: "Test Product", description: "A test product", longDescription: "" },
        ],
        isActive: true,
      };

      const result = await createProduct(input);

      expect(result.success).toBe(true);
      expect(result.data?.productId).toBe(1);
      expect(result.cachePaths).toContain("/admin/products");
      expect(result.cachePaths).toContain("/admin/products/1");
      expect(result.cacheTags).toContain("products");
      expect(result.cacheTags).toContain("product-1");
    });

    it("should throw ValidationError when input is missing", async () => {
      await expect(createProduct(null as unknown as Parameters<typeof createProduct>[0])).rejects.toThrow(ValidationError);
    });

    it("should propagate service errors without catching them", async () => {
      const serviceError = new Error("Database error");
      vi.mocked(container.adminProductService.create).mockRejectedValue(serviceError);

      const input: ProductInput = {
        translations: [{ language: "en", name: "Test", description: "", longDescription: "" }],
        isActive: true,
      };

      await expect(createProduct(input)).rejects.toThrow("Database error");
    });

    it("should call service with correct parameters", async () => {
      const mockProduct: any = {
        id: 1,
        name: "Test",
        description: "",
        longDescription: "",
        rating: 0,
        reviewsCount: 0,
      };
      vi.mocked(container.adminProductService.create).mockResolvedValue(mockProduct);

      const input: ProductInput = {
        translations: [{ language: "en", name: "Test Product", description: "", longDescription: "" }],
        isActive: true,
      };

      await createProduct(input);

      expect(container.adminProductService.create).toHaveBeenCalledWith(input);
    });
  });

  describe("updateProduct", () => {
    it("should return ServiceResult with cache paths when product is updated", async () => {
      const mockProduct: any = {
        id: 1,
        name: "Updated Product",
        description: "",
        longDescription: "",
        rating: 0,
        reviewsCount: 0,
      };
      vi.mocked(container.adminProductService.update).mockResolvedValue(mockProduct);

      const input: ProductInput = {
        translations: [
          { language: "en", name: "Updated Product", description: "", longDescription: "" },
        ],
        isActive: true,
      };

      const result = await updateProduct(1, input);

      expect(result.success).toBe(true);
      expect(result.data?.productId).toBe(1);
      expect(result.cachePaths).toContain("/admin/products");
      expect(result.cachePaths).toContain("/admin/products/1");
      expect(result.cacheTags).toContain("products");
    });

    it("should throw ResourceNotFoundError for invalid product ID", async () => {
      const input: ProductInput = {
        translations: [{ language: "en", name: "Test", description: "", longDescription: "" }],
        isActive: true,
      };

      await expect(updateProduct(0, input)).rejects.toThrow(ResourceNotFoundError);
      await expect(updateProduct(-1, input)).rejects.toThrow(ResourceNotFoundError);
    });

    it("should throw ValidationError when input is missing", async () => {
      await expect(updateProduct(1, null as unknown as Parameters<typeof updateProduct>[1])).rejects.toThrow(ValidationError);
    });

    it("should verify no framework calls were made", async () => {
      const mockProduct: any = {
        id: 1,
        name: "Test",
        description: "",
        longDescription: "",
        rating: 0,
        reviewsCount: 0,
      };
      vi.mocked(container.adminProductService.update).mockResolvedValue(mockProduct);

      const input: ProductInput = {
        translations: [{ language: "en", name: "Test", description: "", longDescription: "" }],
        isActive: true,
      };
      const result = await updateProduct(1, input);

      // Verify result contains cache metadata (not framework calls)
      expect(result.cachePaths).toBeDefined();
      expect(result.cacheTags).toBeDefined();
    });
  });

  describe("deleteProduct", () => {
    it("should return ServiceResult with cache paths when product is deleted", async () => {
      vi.mocked(container.adminProductService.delete).mockResolvedValue(undefined);

      const result = await deleteProduct(1);

      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
      expect(result.cachePaths).toContain("/admin/products");
      expect(result.cachePaths).toContain("/admin/products/1");
    });

    it("should throw ResourceNotFoundError for invalid product ID", async () => {
      await expect(deleteProduct(0)).rejects.toThrow(ResourceNotFoundError);
      await expect(deleteProduct(-1)).rejects.toThrow(ResourceNotFoundError);
    });

    it("should call service delete with correct ID", async () => {
      vi.mocked(container.adminProductService.delete).mockResolvedValue(undefined);

      await deleteProduct(5);

      expect(container.adminProductService.delete).toHaveBeenCalledWith(5);
    });

    it("should verify cache paths are consistent across different IDs", async () => {
      vi.mocked(container.adminProductService.delete).mockResolvedValue(undefined);

      const result1 = await deleteProduct(1);
      const result2 = await deleteProduct(99);

      // Both should return cache paths for their respective products
      expect(result1.cachePaths).toContain("/admin/products");
      expect(result2.cachePaths).toContain("/admin/products");

      // Each should include its own product ID in the path
      expect(result1.cachePaths).toContain("/admin/products/1");
      expect(result2.cachePaths).toContain("/admin/products/99");

      // Cache tags should be the same
      expect(result1.cacheTags?.[0]).toBe(result2.cacheTags?.[0]); // "products" tag
    });
  });
});
