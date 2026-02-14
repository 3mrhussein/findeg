import { db } from "@/infrastructure/config/database.config";
import {
  orders,
  orderItems,
  users,
  type Order as DbOrder,
  type OrderItem as DbOrderItem,
} from "@/infrastructure/database/schema";
import { IOrderRepository, OrderFilters } from "@/application/repositories/IOrderRepository";
import { Order, OrderItem } from "@/domain/entities/Order";
import { AdminOrderStatusUpdate } from "@/domain/types/admin";
import { eq, count as sqlCount, sql, desc, and, gte, lte, ilike, or } from "drizzle-orm";

/**
 * Drizzle Order Repository
 *
 * PostgreSQL implementation of order management using Drizzle ORM.
 * Handles order creation, status updates, revenue tracking, and analytics.
 * Supports both authenticated users and guest checkouts.
 */
export class DrizzleOrderRepository implements IOrderRepository {
  /**
   *
   */
  private mapToDomain(
    dbOrder: DbOrder,
    items: DbOrderItem[] = [],
    customerName?: string,
    customerEmail?: string,
  ): Order {
    return {
      id: dbOrder.id,
      userId: dbOrder.userId || undefined,
      guestEmail: dbOrder.guestEmail || undefined,
      status: dbOrder.status,
      paymentStatus: dbOrder.paymentStatus,
      subtotal: Number(dbOrder.subtotal),
      shippingCost: Number(dbOrder.shippingCost),
      totalAmount: Number(dbOrder.totalAmount),
      currency: dbOrder.currency,
      paymentMethod: dbOrder.paymentMethod || undefined,
      shippingAddressSnapshot: (dbOrder.shippingAddressSnapshot as any) || undefined,
      trackingNumber: dbOrder.trackingNumber || undefined,
      adminNotes: dbOrder.adminNotes || undefined,
      shippingAddress: dbOrder.shippingAddress || undefined,
      billingAddress: dbOrder.billingAddress || undefined,
      createdAt: dbOrder.createdAt,
      updatedAt: dbOrder.updatedAt,
      customerName: customerName,
      customerEmail: customerEmail || dbOrder.guestEmail || undefined,
      items: items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId!,
        quantity: item.quantity,
        priceAtTime: Number(item.priceAtTime),
        unitPriceSnapshot: item.unitPriceSnapshot ? Number(item.unitPriceSnapshot) : undefined,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : undefined,
        productNameSnapshot: item.productNameSnapshot || undefined,
        productSkuSnapshot: item.productSkuSnapshot || undefined,
        variantDetails: item.variantDetails || undefined,
        variantSnapshot: (item.variantSnapshot as any) || undefined,
      })),
    };
  }

  /**
   *
   */
  async getById(id: number): Promise<Order | null> {
    const orderResult = await db
      .select({
        order: orders,
        user: users,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (orderResult.length === 0) return null;

    const itemsResult = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

    // Fallback name if no user
    const customerName = orderResult[0].user
      ? orderResult[0].user.firstName
        ? `${orderResult[0].user.firstName} ${orderResult[0].user.lastName || ""}`
        : orderResult[0].user.name
      : (orderResult[0].order.shippingAddressSnapshot as any)?.fullName || "Guest";

    return this.mapToDomain(
      orderResult[0].order,
      itemsResult,
      customerName || "Unknown",
      orderResult[0].user?.email,
    );
  }

  /**
   *
   */
  async getByUserId(userId: number): Promise<Order[]> {
    const orderResults = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

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
  async getAllFiltered(filters: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    const conditions = [];

    if (filters.status) conditions.push(eq(orders.status, filters.status));
    if (filters.paymentStatus) conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
    if (filters.userId) conditions.push(eq(orders.userId, filters.userId));
    if (filters.startDate) conditions.push(gte(orders.createdAt, filters.startDate));
    if (filters.endDate) conditions.push(lte(orders.createdAt, filters.endDate));

    if (filters.search) {
      // Search by ID (if numeric) or User Email
      if (!isNaN(Number(filters.search))) {
        conditions.push(eq(orders.id, Number(filters.search)));
      } else {
        conditions.push(
          or(
            ilike(orders.guestEmail, `%${filters.search}%`),
            ilike(orders.trackingNumber, `%${filters.search}%`),
          ),
          // ideally we'd join users to search by user name/email too, but simplifying for now
        );
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        order: orders,
        user: users,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    const totalResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(orders)
      .where(whereClause);

    return {
      orders: await Promise.all(
        data.map(async (row) => {
          // Fetch items for each order? Or maybe just return orders without items for list view to be faster?
          // Typically list views don't need line items.
          // Let's fetch basic item count or just empty items for now to optimize,
          // OR fetch items. The interface implies full Order objects.
          // For performance, let's fetch items.
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, row.order.id));

          const name = row.user
            ? row.user.firstName
              ? `${row.user.firstName} ${row.user.lastName || ""}`
              : row.user.name
            : (row.order.shippingAddressSnapshot as any)?.fullName || "Guest";

          return this.mapToDomain(row.order, items, name || "Guest", row.user?.email);
        }),
      ),
      total: totalResult[0]?.count || 0,
    };
  }

  /**
   *
   */
  async create(order: Partial<Order>): Promise<Order> {
    const { items, ...rest } = order;

    return await db.transaction(async (tx) => {
      const dbOrderData: typeof orders.$inferInsert = {
        userId: rest.userId,
        guestEmail: rest.guestEmail,
        status: rest.status || "pending",
        paymentStatus: rest.paymentStatus || "unpaid",
        subtotal: String(rest.subtotal || 0),
        shippingCost: String(rest.shippingCost || 0),
        totalAmount: String(rest.totalAmount || 0),
        currency: rest.currency || "EGP",
        paymentMethod: rest.paymentMethod,
        shippingAddressSnapshot: rest.shippingAddressSnapshot,
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
              unitPriceSnapshot: item.unitPriceSnapshot
                ? String(item.unitPriceSnapshot)
                : String(item.price || 0),
              totalPrice: item.totalPrice
                ? String(item.totalPrice)
                : String((item.price || 0) * item.quantity),
              productNameSnapshot: item.productNameSnapshot,
              productSkuSnapshot: item.productSkuSnapshot,
              variantSnapshot: item.variantSnapshot,
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
  async updateStatusWithTracking(id: number, update: AdminOrderStatusUpdate): Promise<void> {
    const data: any = {
      status: update.status,
      updatedAt: new Date(),
    };

    if (update.trackingNumber) data.trackingNumber = update.trackingNumber;
    if (update.adminNotes) data.adminNotes = update.adminNotes;

    await db.update(orders).set(data).where(eq(orders.id, id));
  }

  /**
   * Updates the payment status of an order
   *
   * @param id - Order ID
   * @param status - New payment status
   */
  async updatePaymentStatus(id: number, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ paymentStatus: status, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  /**
   *
   */
  async getRecent(limit: number = 5): Promise<Order[]> {
    const { orders } = await this.getAllFiltered({ limit });
    return orders;
  }

  /**
   *
   */
  async count(filters?: OrderFilters): Promise<number> {
    const conditions = [];

    if (filters) {
      if (filters.status) conditions.push(eq(orders.status, filters.status));
      if (filters.userId) conditions.push(eq(orders.userId, filters.userId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db.select({ value: sqlCount() }).from(orders).where(whereClause);
    return result[0]?.value || 0;
  }

  /**
   *
   */
  async getOrdersCountByStatus(): Promise<Record<string, number>> {
    const counts = await db
      .select({
        status: orders.status,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(orders)
      .groupBy(orders.status);

    return counts.reduce(
      (acc, curr) => {
        acc[curr.status] = curr.count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   *
   */
  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    const conditions = [];
    if (startDate) conditions.push(gte(orders.createdAt, startDate));
    if (endDate) conditions.push(lte(orders.createdAt, endDate));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({ total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(whereClause);

    return Number(result[0]?.total || 0);
  }

  /**
   *
   */
  async getRevenueByPeriod(
    startDate: Date,
    endDate: Date,
    interval: "day" | "month" = "day",
  ): Promise<{ date: string; revenue: number }[]> {
    // This is PG specific
    const dateFormat = interval === "day" ? "YYYY-MM-DD" : "YYYY-MM";

    // Ensure dates are converted to strings for postgres.js driver
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    const result = await db.execute<{ date: string; revenue: string }>(sql`
      SELECT 
        TO_CHAR(${orders.createdAt}, ${dateFormat}) as date,
        SUM(${orders.totalAmount}) as revenue
      FROM ${orders}
      WHERE ${orders.createdAt} >= ${startStr} AND ${orders.createdAt} <= ${endStr}
      GROUP BY date
      ORDER BY date ASC
    `);

    // For postgres.js driver with drizzle, execute returns the rows directly (RowList)
    return result.map((row) => ({
      date: row.date,
      revenue: Number(row.revenue),
    }));
  }
}
