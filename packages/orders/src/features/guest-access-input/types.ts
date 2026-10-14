import type { z } from 'zod';
import type { GuestAccessRequestSchema, GuestAccessVerifySchema } from './helpers';

export type GuestAccessRequestInput = z.infer<typeof GuestAccessRequestSchema>;
export type GuestAccessVerifyInput = z.infer<typeof GuestAccessVerifySchema>;
