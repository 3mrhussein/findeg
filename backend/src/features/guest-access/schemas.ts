import { z } from 'zod';

export const GuestAccessRequestSchema = z.object({
  reference: z.string().trim().min(1).max(32),
  email: z.string().trim().min(1).max(255).email(),
});

export const GuestAccessVerifySchema = z.object({
  reference: z.string().trim().min(1).max(32),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
});

export type GuestAccessRequestInput = z.infer<typeof GuestAccessRequestSchema>;
export type GuestAccessVerifyInput = z.infer<typeof GuestAccessVerifySchema>;

export interface GuestOrderView {
  orderReference: string;
  status: string;
  paymentStatus: string;
  currency: string;
  subtotal: string;
  shippingCost: string | null;
  totalAmount: string;
  createdAt: Date;
  items: Array<{ name: string; quantity: number; totalPrice: string | null }>;
}
