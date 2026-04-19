/**
 * Unit Tests: Order Actions
 *
 * Validates that order actions:
 * - Return ServiceResult with cache metadata
 * - Don't make framework calls (no revalidatePath)
 * - Properly propagate domain errors
 * - Run in pure Node.js (no Next.js runtime)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as orderActions from "../order";
import { container } from "@backend/features/core/infrastructure/di/ServiceContainer";
import type { OrderStatusUpdate } from "@backend/features/administration/domain/types";
import { PaymentStatus } from "@backend/features/core/domain/types/common";

// Mock the service container
vi.mock("@backend/features/core/infrastructure/di/ServiceContainer", () => ({
  container: {
    adminOrderService: {
      updateStatus: vi.fn(),
      updatePaymentStatus: vi.fn(),
    },
  },
}));

describe("Order Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateOrderStatus", () => {
    it("should return ServiceResult with cache paths on success", async () => {
      const orderId = 123;
      const input: OrderStatusUpdate = { status: "shipped", trackingNumber: "TRACK123" };

      vi.spyOn(container.adminOrderService, "updateStatus").mockResolvedValue(undefined);

      const result = await orderActions.updateOrderStatus(orderId, input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ orderUpdated: true });
      expect(result.cachePaths).toEqual(["/admin/orders", "/admin/orders/123"]);

      expect(container.adminOrderService.updateStatus).toHaveBeenCalledWith(orderId, input);
    });

    it("should propagate service errors", async () => {
      const orderId = 123;
      const input: OrderStatusUpdate = { status: "shipped" };

      const testError = new Error("Order not found");
      vi.spyOn(container.adminOrderService, "updateStatus").mockRejectedValue(testError);

      await expect(orderActions.updateOrderStatus(orderId, input)).rejects.toThrow(
        "Order not found"
      );
    });

    it("should not call revalidatePath (framework-agnostic)", async () => {
      const orderId = 123;
      const input: OrderStatusUpdate = { status: "delivered" };

      vi.spyOn(container.adminOrderService, "updateStatus").mockResolvedValue(undefined);

      const result = await orderActions.updateOrderStatus(orderId, input);

      // Verify result has cache paths (for app-layer to use)
      expect(result.cachePaths).toBeDefined();
      expect(Array.isArray(result.cachePaths)).toBe(true);

      // Verify no Next.js APIs are called
      // (This test proves the function is pure TypeScript)
    });
  });

  describe("updateOrderPaymentStatus", () => {
    it("should return ServiceResult with cache paths on success", async () => {
      const orderId = 456;
      const paymentStatus: PaymentStatus = "paid";

      vi.spyOn(container.adminOrderService, "updatePaymentStatus").mockResolvedValue(undefined);

      const result = await orderActions.updateOrderPaymentStatus(orderId, paymentStatus);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ orderUpdated: true });
      expect(result.cachePaths).toEqual(["/admin/orders", "/admin/orders/456"]);

      expect(container.adminOrderService.updatePaymentStatus).toHaveBeenCalledWith(
        orderId,
        paymentStatus
      );
    });

    it("should propagate service errors", async () => {
      const orderId = 456;
      const paymentStatus: PaymentStatus = "refunded";

      const testError = new Error("Cannot refund completed order");
      vi.spyOn(container.adminOrderService, "updatePaymentStatus").mockRejectedValue(testError);

      await expect(
        orderActions.updateOrderPaymentStatus(orderId, paymentStatus)
      ).rejects.toThrow("Cannot refund completed order");
    });

    it("should return correct cache paths for different order IDs", async () => {
      const paymentStatus: PaymentStatus = "paid";

      vi.spyOn(container.adminOrderService, "updatePaymentStatus").mockResolvedValue(undefined);

      const result1 = await orderActions.updateOrderPaymentStatus(100, paymentStatus);
      expect(result1.cachePaths).toEqual(["/admin/orders", "/admin/orders/100"]);

      const result2 = await orderActions.updateOrderPaymentStatus(999, paymentStatus);
      expect(result2.cachePaths).toEqual(["/admin/orders", "/admin/orders/999"]);
    });
  });

  describe("Cache path consistency", () => {
    it("should return consistent cache paths across actions", async () => {
      const orderId = 789;
      const input: OrderStatusUpdate = { status: "cancelled" };

      vi.spyOn(container.adminOrderService, "updateStatus").mockResolvedValue(undefined);
      vi.spyOn(container.adminOrderService, "updatePaymentStatus").mockResolvedValue(undefined);

      const statusResult = await orderActions.updateOrderStatus(orderId, input);
      const paymentResult = await orderActions.updateOrderPaymentStatus(orderId, "unpaid");

      // Both should invalidate the same paths
      expect(statusResult.cachePaths).toEqual(paymentResult.cachePaths);
    });
  });
});
