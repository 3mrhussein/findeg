import { Order } from "@/domain/entities/Order";

export interface IOrderRepository {
  getById(id: number): Promise<Order | null>;
  getByUserId(userId: number): Promise<Order[]>;
  create(order: Partial<Order>): Promise<Order>;
  updateStatus(id: number, status: string): Promise<void>;
}
