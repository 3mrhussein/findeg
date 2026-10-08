import { z } from 'zod';
import { OrderStatusSchema, PaymentStatusSchema } from '@findeg/db/types';
export const positiveId = z.number().int().positive().max(2_147_483_647);
/** Largest page an Order list returns. */
export const MAX_ORDER_PAGE_SIZE = 100;
export const pageSize = z.number().int().positive().max(MAX_ORDER_PAGE_SIZE);
export const orderId = z.union([
  positiveId,
  z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(positiveId),
]);
export const filtersSchema = z
  .object({
    status: OrderStatusSchema.optional(),
    paymentStatus: PaymentStatusSchema.optional(),
    userId: positiveId.optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    search: z.string().optional(),
    limit: pageSize.optional(),
    offset: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
  })
  .refine((f) => !f.startDate || !f.endDate || f.startDate <= f.endDate, 'Reversed date range');
