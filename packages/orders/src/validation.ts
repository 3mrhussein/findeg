import { z } from 'zod';
import { OrderStatusSchema, PaymentStatusSchema } from '@findeg/db/types';
export const positiveId = z.number().int().positive().max(2_147_483_647);
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
    limit: positiveId.optional(),
    offset: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
  })
  .refine((f) => !f.startDate || !f.endDate || f.startDate <= f.endDate, 'Reversed date range');
