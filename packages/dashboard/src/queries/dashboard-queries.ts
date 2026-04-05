/**
 * Dashboard Data Queries
 *
 * Server queries that wrap pure backend queries with Next.js integration:
 * - Extracts session from cookies/headers
 * - Passes userId to pure backend functions
 * - Handles domain errors appropriately
 * - Uses "use cache" for performance
 *
 * These queries are used directly in Server Components.
 */

import {
  getDashboardData,
  getMyAccountData,
  getMyOrderDetail,
} from "@findeg/backend/features/identity";
import { getSession } from "@/lib/session";
import { handleDomainError } from "@/lib/errors";

/**
 * Query: Get dashboard data for authenticated user
 *
 * Throws/redirects on authentication error via handleDomainError.
 * Uses getSession() to extract userId from cookies.
 *
 * @param locale - Current locale
 * @returns Dashboard data (products, orders, school lists, session)
 * @throws Redirects to /login if not authenticated
 */
export async function getDashboardDataQuery(locale: string) {
  const session = await getSession();
  const userId = session?.userId;

  try {
    return await getDashboardData(locale, userId);
  } catch (error) {
    // handleDomainError will redirect(/login) or throw
    handleDomainError(error, "dashboard-query");
  }
}

/**
 * Query: Get user's account data
 *
 * Throws/redirects on authentication error via handleDomainError.
 * Uses getSession() to extract userId from cookies.
 *
 * @returns User account data (profile + orders)
 * @throws Redirects to /login if not authenticated
 * @throws Redirects to 404 if user not found
 */
export async function getMyAccountDataQuery() {
  const session = await getSession();
  const userId = session?.userId;

  try {
    return await getMyAccountData(userId);
  } catch (error) {
    handleDomainError(error, "my-account-query");
  }
}

/**
 * Query: Get user's specific order detail
 *
 * Throws/redirects on authentication error or if order not found.
 * Uses getSession() to extract userId for ownership check.
 *
 * @param orderId - Order ID to fetch
 * @returns Order detail
 * @throws Redirects to /login if not authenticated
 * @throws Redirects to 404 if order not found or doesn't belong to user
 */
export async function getMyOrderDetailQuery(orderId: number) {
  const session = await getSession();
  const userId = session?.userId;

  try {
    return await getMyOrderDetail(orderId, userId);
  } catch (error) {
    handleDomainError(error, "my-order-detail-query");
  }
}
