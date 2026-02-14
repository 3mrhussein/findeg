import { Order } from "@/domain/entities/Order";
import { AdminOrderStatusUpdate } from "@/domain/types/admin";
import { OrderFilters } from "@/application/repositories/IOrderRepository";

export interface IAdminOrderService {
  getAll(filters: OrderFilters): Promise<{ orders: Order[]; total: number }>;
  getById(id: number): Promise<Order | null>;
  updateStatus(id: number, update: AdminOrderStatusUpdate): Promise<void>;
  updatePaymentStatus(id: number, status: string): Promise<void>;

  // Analytics
  getDashboardStats(): Promise<any>; // Type to be refined later in Dashboard Service
}
