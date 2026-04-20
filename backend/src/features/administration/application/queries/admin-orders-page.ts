import { createAdministrationServices } from "../services/factory";
import {
  OrderStatusSchema,
  PaymentStatusSchema,
  type OrderStatus,
  type PaymentStatus,
} from "@findeg/backend/features/core/domain/types/common";
import type { Order } from "@findeg/backend/features/order/domain/entities/Order";

export interface AdminOrdersPageQueryParams {
  search?: string;
  status?: string;
  paymentStatus?: string;
  page?: string;
  limit?: string;
}

export interface AdminOrdersPageData {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 *
 */
function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

/**
 * Resolves paginated admin orders list with normalized filters.
 */
export async function getAdminOrdersPageData(
  params: AdminOrdersPageQueryParams,
): Promise<AdminOrdersPageData> {
  const page = parsePositiveInt(params.page, 1);
  const limit = Math.min(parsePositiveInt(params.limit, DEFAULT_LIMIT), MAX_LIMIT);
  const search = params.search?.trim() || "";
  const rawStatus = params.status?.trim() || undefined;
  const rawPaymentStatus = params.paymentStatus?.trim() || undefined;
  const status =
    rawStatus && OrderStatusSchema.safeParse(rawStatus).success
      ? (rawStatus as OrderStatus)
      : undefined;
  const paymentStatus =
    rawPaymentStatus && PaymentStatusSchema.safeParse(rawPaymentStatus).success
      ? (rawPaymentStatus as PaymentStatus)
      : undefined;

  const { orders: adminOrder } = createAdministrationServices();
  const { orders, total } = await adminOrder.getAll({
    search: search || undefined,
    status,
    paymentStatus,
    limit,
    offset: (page - 1) * limit,
  });

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    search,
    status,
    paymentStatus,
  };
}
