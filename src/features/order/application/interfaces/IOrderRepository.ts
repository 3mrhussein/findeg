import { Order } from "../../domain/entities/Order";
import { OrderStatusUpdate } from "@/features/administration/domain/types";

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  search?: string; // Search by ID, customer name, email
  limit?: number;
  offset?: number;
}

export interface IOrderRepository {
  getById(id: number): Promise<Order | null>;
  getByUserId(userId: number): Promise<Order[]>;
  getAllFiltered(filters: OrderFilters): Promise<{ orders: Order[]; total: number }>;

  create(order: Partial<Order>): Promise<Order>;
  updateStatus(id: number, status: string): Promise<void>;
  updateStatusWithTracking(id: number, update: OrderStatusUpdate): Promise<void>;
  updatePaymentStatus(id: number, status: string): Promise<void>;

  getRecent(limit?: number): Promise<Order[]>;
  count(filters?: OrderFilters): Promise<number>;
  getOrdersCountByStatus(): Promise<Record<string, number>>;

  // Analytics
  getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number>;
  getRevenueByPeriod(
    startDate: Date,
    endDate: Date,
    interval: "day" | "month",
  ): Promise<{ date: string; revenue: number }[]>;
}
