import { db } from "@/infrastructure/config/database.config";
import {
  orders,
  orderItems,
  type Order as DbOrder,
  type OrderItem as DbOrderItem,
} from "@/infrastructure/database/schema";
import { IOrderRepository } from "@/application/repositories/IOrderRepository";
import { Order, OrderItem } from "@/domain/entities/Order";
import { eq, count as sqlCount, sql, desc } from "drizzle-orm";

/**
 *
 */
export class DrizzleOrderRepository implements IOrderRepository {
  /**
   *
   */
  private mapToDomain(dbOrder: DbOrder, items: DbOrderItem[] = []): Order {
    return {
      id: dbOrder.id,
      userId: dbOrder.userId || undefined,
      status: dbOrder.status,
      totalAmount: Number(dbOrder.totalAmount),
      currency: dbOrder.currency,
      shippingAddress: dbOrder.shippingAddress || undefined,
      billingAddress: dbOrder.billingAddress || undefined,
      createdAt: dbOrder.createdAt,
      updatedAt: dbOrder.updatedAt,
      items: items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId!,
        quantity: item.quantity,
        priceAtTime: Number(item.priceAtTime),
        variantDetails: item.variantDetails || undefined,
      })),
    };
  }

  /**
   *
   */
  async getById(id: number): Promise<Order | null> {
    const orderResult = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (orderResult.length === 0) return null;

    const itemsResult = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return this.mapToDomain(orderResult[0], itemsResult);
  }

  /**
   *
   */
  async getByUserId(userId: number): Promise<Order[]> {
    const orderResults = await db.select().from(orders).where(eq(orders.userId, userId));

    const ordersWithItems = await Promise.all(
      orderResults.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return this.mapToDomain(order, items);
      }),
    );

    return ordersWithItems;
  }

  /**
   *
   */
  async create(order: Partial<Order>): Promise<Order> {
    const { items, ...rest } = order;

    return await db.transaction(async (tx) => {
      const dbOrderData: typeof orders.$inferInsert = {
        userId: rest.userId,
        status: rest.status || "pending",
        totalAmount: String(rest.totalAmount || rest.total || 0),
        currency: rest.currency || "USD",
        shippingAddress: rest.shippingAddress,
        billingAddress: rest.billingAddress,
      };

      const [newOrder] = await tx.insert(orders).values(dbOrderData).returning();

      let newItems: DbOrderItem[] = [];
      if (items && items.length > 0) {
        newItems = await tx
          .insert(orderItems)
          .values(
            items.map((item) => ({
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: String(item.priceAtTime || item.price || 0),
              variantDetails: item.variantDetails,
            })),
          )
          .returning();
      }

      return this.mapToDomain(newOrder, newItems);
    });
  }

  /**
   *
   */
  async updateStatus(id: number, status: string): Promise<void> {
    await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  }

  /**
   *
   */
  async getRecent(limit: number = 5): Promise<Order[]> {
    const orderResults = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    const ordersWithItems = await Promise.all(
      orderResults.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return this.mapToDomain(order, items);
      }),
    );

    return ordersWithItems;
  }

  /**
   *
   */
  async count(): Promise<number> {
    const result = await db.select({ value: sqlCount() }).from(orders);
    return result[0]?.value || 0;
  }

  /**
   *
   */
  async getTotalRevenue(): Promise<number> {
    const result = await db
      .select({ total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)` })
      .from(orders);
    return Number(result[0]?.total || 0);
  }
}
