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

const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value &&
      value >= '0001-01-01'
    );
  }, 'Invalid calendar date');
export const statsOptionsSchema = z
  .object({
    from: calendarDate.optional(),
    to: calendarDate.optional(),
    trendDays: z.number().int().min(1).max(366).default(30),
    topProductsLimit: z.number().int().min(1).max(100).default(5),
  })
  .refine(
    (options) => !options.from || !options.to || options.from <= options.to,
    'Reversed date range',
  );
