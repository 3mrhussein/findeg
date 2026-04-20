/**
 * Pure TypeScript Dashboard Query
 *
 * Returns dashboard data or throws domain errors (no framework calls).
 * App-layer catches errors and handles redirect/error responses.
 */

import { createCatalogServices } from "@findeg/backend/features/catalog";
import { createOrderServices } from "@findeg/backend/features/order";
import { NotAuthenticatedError } from "@findeg/backend/features/core/domain/errors";
import { resolveLocale } from "@findeg/backend/features/core/domain/value-objects";
import type { Product } from "@findeg/backend/features/catalog/domain/entities/Product";
import type { Order } from "@findeg/backend/features/order/domain/entities/Order";
import type { SessionPayload } from "@findeg/backend/features/core/domain/auth";
import type { SchoolListResult } from "@findeg/backend/features/catalog/application/interfaces/ISchoolListRepository";

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
  const { products, schoolLists } = createCatalogServices();
  const { orders } = createOrderServices();

  const [allProducts, userOrders, allSchoolLists] = await Promise.all([
    products.getAll(resolvedLocale),
    orders.getByUserId(userId),
    schoolLists.getAllLists(),
  ]);

  return {
    products: allProducts,
    orders: userOrders,
    schoolLists: allSchoolLists,
    // Session is provided by app-layer
  };
}
