import type { Order } from "@backend/features/order";

/**
 * Local type definitions
 */
import type { OrderStatus, PaymentStatus } from "@backend/features/core/domain/types/common";

export interface OrderTableFiltersData {
  search?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateOrderQueryParams {
  search?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
}

export interface OrderTableProps {
  data: Order[];
  page: number;
  limit: number;
  total: number;
  statusCounts: Record<string, number>;
  filters: OrderTableFiltersData;
}
