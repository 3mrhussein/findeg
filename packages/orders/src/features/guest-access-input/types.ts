import type { z } from 'zod';
import type {
  GuestAccessRequestSchema as guestAccessRequestSchema,
  GuestAccessVerifySchema as guestAccessVerifySchema,
} from './helpers';

export type GuestAccessRequestInput = z.infer<typeof guestAccessRequestSchema>;
export type GuestAccessVerifyInput = z.infer<typeof guestAccessVerifySchema>;
