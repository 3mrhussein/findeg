import { getServices } from "@/server/getServices";
import { redirect } from "next/navigation";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { Order } from "@/features/order/domain/entities/Order";
import { resolveLocale } from "@/features/core/domain/value-objects";
import type { SchoolListResult } from "@/features/catalog/application/interfaces/ISchoolListRepository";

export interface DashboardData {
  products: Product[];
  orders: Order[];
  schoolLists: SchoolListResult[];
}

/**
 * Resolves authenticated dashboard data (products + user's orders).
 */
export async function getDashboardDataOrRedirect(locale: string): Promise<DashboardData> {
  const resolvedLocale = resolveLocale(locale);
  const { auth, products, schoolLists, repositories } = getServices();
  const session = await auth.getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const [allProducts, userOrders, allSchoolLists] = await Promise.all([
    products.getAll(resolvedLocale),
    repositories.orders.getByUserId(session.userId),
    schoolLists.getAllLists(),
  ]);

  return {
    products: allProducts,
    orders: userOrders,
    schoolLists: allSchoolLists,
  };
}
