/**
 * Dashboard Data Queries
 *
 * Queries for dashboard-specific data using backend services.
 * All queries use "use cache" for performance.
 */

"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { createIdentityServices } from "@backend/features/identity";

/**
 * Get dashboard data for authenticated user
 *
 * TODO: Implement using administration services
 */
export async function getDashboardDataQuery(locale: string) {
  throw new Error("Not implemented - needs administration service implementation");
}

/**
 * Get account data for authenticated user
 */
export async function getMyAccountDataQuery(userId: number) {
  cacheLife("minutes");
  cacheTag("my-account");

  // Use identity service to get user data
  const { adminUsers } = createIdentityServices();
  const user = await adminUsers.getAdmin(userId);

  return user;
}

/**
 * Get order detail for authenticated user
 *
 * TODO: Implement using order repositories
 */
export async function getMyOrderDetailQuery(orderId: number, locale: string) {
  throw new Error("Not implemented - needs order service implementation");
}
