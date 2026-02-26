import { getServices } from "@/server/getServices";
import { redirect } from "next/navigation";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { Order } from "@/features/order/domain/entities/Order";
import { resolveLocale } from "@/features/core/domain/value-objects";

export interface DashboardData {
  products: Product[];
  orders: Order[];
}

/**
 * Resolves authenticated dashboard data (products + user's orders).
 */
export async function getDashboardDataOrRedirect(locale: string): Promise<DashboardData> {
  const resolvedLocale = resolveLocale(locale);
  const { auth, products, repositories } = getServices();
  const session = await auth.getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const [allProducts, userOrders] = await Promise.all([
    products.getAll(resolvedLocale),
    repositories.orders.getByUserId(session.userId),
  ]);

  return {
    products: allProducts,
    orders: userOrders,
  };
}
