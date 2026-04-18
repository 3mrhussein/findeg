import { type ID } from "@backend/features/core/domain/types/common";
import { type IOrderRepository, type OrderFilters } from "../interfaces/IOrderRepository";
import { type Order } from "../../domain/entities/Order";

/**
 * Order Service - Pure TypeScript
 * 
 * Provides order query and retrieval functionality.
 * For admin operations (status updates), use AdminOrderService from administration feature.
 */
export class OrderService {
  constructor(private orderRepository: IOrderRepository) {}

  async getAll(filters?: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    return this.orderRepository.getAllFiltered(filters || {});
  }

  async getById(id: ID | string): Promise<Order | null> {
    return this.orderRepository.getById(id);
  }

  async getByUserId(userId: ID): Promise<Order[]> {
    return this.orderRepository.getByUserId(userId);
  }

  async getRecent(limit?: number): Promise<Order[]> {
    return this.orderRepository.getRecent(limit);
  }

  async count(filters?: OrderFilters): Promise<number> {
    return this.orderRepository.count(filters);
  }
}
