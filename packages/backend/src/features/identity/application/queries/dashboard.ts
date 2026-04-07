/**
 * Pure TypeScript Dashboard Query
 *
 * Returns dashboard data or throws domain errors (no framework calls).
 * App-layer catches errors and handles redirect/error responses.
 */

import { getServices } from "@server/getServices";
import { NotAuthenticatedError } from "@features/core/domain/errors";
import { resolveLocale } from "@features/core/domain/value-objects";
import type { Product } from "@features/catalog/domain/entities/Product";
import type { Order } from "@features/order/domain/entities/Order";
import type { SessionPayload } from "@features/core/domain/auth";
import type { SchoolListResult } from "@features/catalog/application/interfaces/ISchoolListRepository";

export interface DashboardData {
  products: Product[];
  orders: Order[];
  schoolLists: SchoolListResult[];
  session?: SessionPayload; // Optional - app layer will provide full session
}

/**
 * Pure dashboard data query - no framework calls.
 *
 * Accepts userId parameter (inject from app-layer session).
 * Throws NotAuthenticatedError if userId is null.
 * App-layer catches errors and handles redirect.
 *
 * @param locale - Resolved locale
 * @param userId - User ID from session (must be passed in, not read globally)
 * @returns Dashboard data (products, orders, school lists)
 * @throws NotAuthenticatedError if userId is not provided
 */
export async function getDashboardData(
  locale: string,
  userId: number | null | undefined,
): Promise<DashboardData> {
  if (!userId) {
    throw new NotAuthenticatedError("Session required to access dashboard");
  }

  const resolvedLocale = resolveLocale(locale);
  const { products, schoolLists, repositories } = getServices();

  const [allProducts, userOrders, allSchoolLists] = await Promise.all([
    products.getAll(resolvedLocale),
    repositories.orders.getByUserId(userId),
    schoolLists.getAllLists(),
  ]);

  return {
    products: allProducts,
    orders: userOrders,
    schoolLists: allSchoolLists,
    // Session is provided by app-layer
  };
}

