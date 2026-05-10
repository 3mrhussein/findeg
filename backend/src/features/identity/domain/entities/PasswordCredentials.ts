import { ID } from '@findeg/backend/features/core/domain/types/common';

export type HashStrategy = 'bcrypt' | 'argon2';

export interface PasswordCredentials {
  userId: ID;
  passwordHash: string;
  hashStrategy: HashStrategy;
  createdAt: Date;
  updatedAt: Date;
}
