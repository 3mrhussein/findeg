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
