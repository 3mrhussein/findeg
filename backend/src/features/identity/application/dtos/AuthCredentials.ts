import { z } from 'zod';
import { EmailSchema } from '@findeg/db';

export const AuthCredentialsSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>;