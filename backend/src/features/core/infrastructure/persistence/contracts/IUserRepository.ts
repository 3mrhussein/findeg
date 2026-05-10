/**
 * User Repository Contract
 *
 * Defines the interface for user data access operations.
 * Backend package exports this interface; frontend packages import it.
 */

export type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserFilters = {
  roles?: string[];
  isActive?: boolean;
  search?: string; // search by name or email
  limit?: number;
  offset?: number;
};

export type CreateUserInput = {
  email: string;
  name: string;
  password: string;
  roles?: string[];
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'email'>>;

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findMany(filters: UserFilters): Promise<User[]>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
  count(filters?: UserFilters): Promise<number>;
}
