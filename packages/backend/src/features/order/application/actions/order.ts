/**
 * Pure TypeScript Order Actions
 *
 * These actions contain business logic only - no framework-specific calls (no "use server", no revalidatePath).
 * App-layer (dashboard) handles revalidatePath() after successful order updates.
 *
 * This enables:
 * - Pure TypeScript execution in Vitest (no Next.js runtime needed)
 * - Framework portability
 * - Clear separation of concerns (backend = logic, app = framework integration)
 */

import { container } from "@features/core/infrastructure/di/ServiceContainer";
import { OrderStatusUpdate } from "@features/administration/domain/types";
import { getOrderCachePaths } from "@features/order/domain/cache";
import type { ServiceResult } from "@features/core/application/types";
import { PaymentStatus } from "@features/core/domain/types/common";

/**
 * Pure order status update - no framework calls.
 *
 * Returns ServiceResult with cache paths that app-layer uses to revalidate.
 * Throws domain errors instead of returning error objects.
 *
 * @param id - The ID of the order to update
 * @param input - The new status and optional tracking information
 * @returns ServiceResult with success flag and cache paths to invalidate
 */
export async function updateOrderStatus(
  id: number,
  input: OrderStatusUpdate,
): Promise<ServiceResult<{ orderUpdated: true }>> {
  const service = container.adminOrderService;
  await service.updateStatus(id, input);

  return {
    success: true,
    data: { orderUpdated: true },
    cachePaths: getOrderCachePaths(id),
  };
}

/**
 * Pure payment status update - no framework calls.
 *
 * Returns ServiceResult with cache paths that app-layer uses to revalidate.
 * Throws domain errors instead of returning error objects.
 *
 * @param id - The ID of the order to update
 * @param paymentStatus - The new payment status
 * @returns ServiceResult with success flag and cache paths to invalidate
 */
export async function updateOrderPaymentStatus(
  id: number,
  paymentStatus: PaymentStatus,
): Promise<ServiceResult<{ orderUpdated: true }>> {
  const service = container.adminOrderService;
  await service.updatePaymentStatus(id, paymentStatus);

  return {
    success: true,
    data: { orderUpdated: true },
    cachePaths: getOrderCachePaths(id),
  };
}
