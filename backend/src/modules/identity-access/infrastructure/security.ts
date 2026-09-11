import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { IdentitySecurity } from '../public.js';

export function createIdentitySecurity(): IdentitySecurity {
  return {
    digest: (token) => createHash('sha256').update(token).digest('hex'),
    newToken: () => randomBytes(32).toString('base64url'),
    now: () => new Date(),
    verifyPassword: (password, hash) => bcrypt.compare(password, hash),
  };
}
