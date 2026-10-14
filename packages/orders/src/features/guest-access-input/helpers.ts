import { z } from 'zod';

const guestAccessRequestSchema = z.object({
  reference: z.string().trim().min(1).max(32),
  email: z.string().trim().min(1).max(255).pipe(z.email()),
});

const guestAccessVerifySchema = z.object({
  reference: z.string().trim().min(1).max(32),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
});

export {
  guestAccessRequestSchema as GuestAccessRequestSchema,
  guestAccessVerifySchema as GuestAccessVerifySchema,
};
