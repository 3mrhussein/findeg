import { z } from "zod";
import { OrderStatusSchema } from "@/features/core/domain/types/common";

export const OrderStatusUpdateSchema = z.object({
  status: OrderStatusSchema,
  trackingNumber: z.string().optional(),
  adminNotes: z.string().optional(),
});

export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>;
