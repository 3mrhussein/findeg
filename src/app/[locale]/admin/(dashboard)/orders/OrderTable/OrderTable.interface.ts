import type { Order } from "@/features/order/domain/entities/Order";
import type { OrderStatus, PaymentStatus } from "@/features/core/domain/types/common";

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
