/**
 * Cache Invalidator Interface (OPTIONAL)
 * 
 * Contract for cache invalidation notifications.
 * Backend calls this interface; app-layer provides Next.js implementation.
 * 
 * NOTE: This is an OPTIONAL pattern. The simpler alternative is to return
 * cache metadata (paths/tags) as data from backend services, and let
 * app-layer execute revalidation imperatively.
 * 
 * Use this interface ONLY IF:
 * - You prefer observer pattern over imperative revalidation
 * - Backend services should trigger cache invalidation as side effect
 * - Multiple cache backends need to be notified
 * 
 * Otherwise, use the simpler pattern documented in data-model.md (ServiceResult<T>).
 */

export interface ICacheInvalidator {
  /**
   * Notifies cache to invalidate specific route paths.
   * 
   * Implementation details:
   * - App-layer: Calls Next.js `revalidatePath()` for each path
   * - Test: Records invalidation calls for verification
   * 
   * @param paths - Array of route paths to revalidate (e.g., ["/admin/orders", "/admin/orders/123"])
   */
  invalidatePaths(paths: string[]): Promise<void>;
  
  /**
   * Notifies cache to invalidate specific cache tags.
   * 
   * Implementation details:
   * - App-layer: Calls Next.js `revalidateTag()` for each tag
   * - Test: Records invalidation calls for verification
   * 
   * @param tags - Array of cache tags to revalidate (e.g., ["products", "orders"])
   */
  invalidateTags(tags: string[]): Promise<void>;
}

/**
 * No-op implementation for testing.
 * Use when backend services are tested in isolation without cache invalidation.
 */
export class NoOpCacheInvalidator implements ICacheInvalidator {
  async invalidatePaths(paths: string[]): Promise<void> {
    // No-op: no cache invalidation in tests
  }
  
  async invalidateTags(tags: string[]): Promise<void> {
    // No-op: no cache invalidation in tests
  }
}

/**
 * Recording implementation for test verification.
 * Use when you need to verify which paths/tags were invalidated.
 */
export class RecordingCacheInvalidator implements ICacheInvalidator {
  public invalidatedPaths: string[] = [];
  public invalidatedTags: string[] = [];
  
  async invalidatePaths(paths: string[]): Promise<void> {
    this.invalidatedPaths.push(...paths);
  }
  
  async invalidateTags(tags: string[]): Promise<void> {
    this.invalidatedTags.push(...tags);
  }
  
  reset(): void {
    this.invalidatedPaths = [];
    this.invalidatedTags = [];
  }
}

/**
 * Usage Example (Backend Service with Observer Pattern):
 * 
 * ```typescript
 * class OrderService {
 *   constructor(
 *     private repository: IOrderRepository,
 *     private cacheInvalidator: ICacheInvalidator
 *   ) {}
 * 
 *   async updateStatus(id: number, input: OrderStatusUpdate): Promise<Order> {
 *     const order = await this.repository.getById(id);
 *     if (!order) throw new ResourceNotFoundError("Order", id);
 * 
 *     order.updateStatus(input.status, input.trackingNumber);
 *     await this.repository.save(order);
 * 
 *     // Notify cache to invalidate
 *     await this.cacheInvalidator.invalidatePaths(["/admin/orders", `/admin/orders/${id}`]);
 *     await this.cacheInvalidator.invalidateTags(["orders", "admin-orders"]);
 * 
 *     return order;
 *   }
 * }
 * ```
 * 
 * Usage Example (App-Layer Implementation):
 * 
 * ```typescript
 * import { revalidatePath, revalidateTag } from "next/cache";
 * import { ICacheInvalidator } from "@findeg/backend/features/core";
 * 
 * export class NextJsCacheInvalidator implements ICacheInvalidator {
 *   async invalidatePaths(paths: string[]): Promise<void> {
 *     for (const path of paths) {
 *       revalidatePath(path);
 *     }
 *   }
 * 
 *   async invalidateTags(tags: string[]): Promise<void> {
 *     for (const tag of tags) {
 *       revalidateTag(tag);
 *     }
 *   }
 * }
 * ```
 * 
 * Usage Example (Test):
 * 
 * ```typescript
 * import { describe, it, expect } from "vitest";
 * import { RecordingCacheInvalidator } from "@findeg/backend/features/core";
 * 
 * describe("OrderService", () => {
 *   it("invalidates order cache after status update", async () => {
 *     const cacheInvalidator = new RecordingCacheInvalidator();
 *     const service = new OrderService(mockRepository, cacheInvalidator);
 * 
 *     await service.updateStatus(123, { status: "shipped" });
 * 
 *     expect(cacheInvalidator.invalidatedPaths).toContain("/admin/orders");
 *     expect(cacheInvalidator.invalidatedPaths).toContain("/admin/orders/123");
 *     expect(cacheInvalidator.invalidatedTags).toContain("orders");
 *   });
 * });
 * ```
 * 
 * RECOMMENDATION: Start with the simpler pattern (ServiceResult<T>) documented
 * in data-model.md. Only use this interface if observer pattern is truly needed.
 */
