/**
 * Pure TypeScript My Account Queries
 *
 * Returns user account data or throws domain errors (no framework calls).
 * App-layer catches errors and handles redirect/notFound/error responses.
 */

import { getServices } from "@/server/getServices";
import { NotAuthenticatedError, ResourceNotFoundError } from "@/features/core/domain/errors";
import type { User } from "@/features/identity/domain/entities/User";
import type { Order } from "@/features/order/domain/entities/Order";

export interface MyAccountData {
  user: User;
  orders: Order[];
  userId: number;
}

/**
 * Pure my account data query - no framework calls.
 *
 * Accepts userId parameter (inject from app-layer session).
 * Throws NotAuthenticatedError if userId is null.
 * Throws ResourceNotFoundError if user not found.
 * App-layer catches errors and handles redirect/notFound.
 *
 * @param userId - User ID from session (must be passed in)
 * @returns User account data (profile + orders)
 * @throws NotAuthenticatedError if userId not provided
 * @throws ResourceNotFoundError if user not found
 */
export async function getMyAccountData(userId: number | null | undefined): Promise<MyAccountData> {
  if (!userId) {
    throw new NotAuthenticatedError("Session required to access my account");
  }

  const { repositories } = getServices();

  const [user, orders] = await Promise.all([
    repositories.users.getById(userId),
    repositories.orders.getByUserId(userId),
  ]);

  if (!user) {
    throw new ResourceNotFoundError("User", userId);
  }

  return {
    user,
    orders,
    userId,
  };
}

/**
 * Pure my order detail query - no framework calls.
 *
 * Returns a user-owned order or throws domain errors.
 * Throws NotAuthenticatedError if userId is null.
 * Throws ResourceNotFoundError if order not found or doesn't belong to user.
 * App-layer catches errors and handles notFound/error responses.
 *
 * @param orderId - Order ID to fetch
 * @param userId - User ID from session (for ownership check)
 * @returns Order detail
 * @throws NotAuthenticatedError if userId not provided
 * @throws ResourceNotFoundError if order not found or doesn't belong to user
 */
export async function getMyOrderDetail(
  orderId: number,
  userId: number | null | undefined,
): Promise<Order> {
  if (!userId) {
    throw new NotAuthenticatedError("Session required to view order");
  }

  const { repositories } = getServices();
  const order = await repositories.orders.getById(orderId);

  if (!order || order.userId !== userId) {
    throw new ResourceNotFoundError("Order", orderId);
  }

  return order;
}
