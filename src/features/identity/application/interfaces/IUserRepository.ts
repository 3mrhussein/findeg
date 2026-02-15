import { User } from "../../domain/entities/User";
import { UserWithPassword } from "../../domain/types/auth";

/**
 * User Repository Interface
 *
 * Defines the contract for user data access and profile management.
 */
export interface IUserRepository {
  /**
   * Retrieves a safe user profile by ID (no sensitive data).
   */
  getById(id: number): Promise<User | null>;

  /**
   * Retrieves a safe user profile by email (no sensitive data).
   */
  getByEmail(email: string): Promise<User | null>;

  /**
   * Retrieves a user including their hashed password for authentication.
   * INTERNAL USE ONLY.
   */
  getByEmailWithPassword(email: string): Promise<UserWithPassword | null>;

  /**
   * Persists a new user to storage.
   */
  create(user: Partial<User>): Promise<User>;

  /**
   * Updates an existing user's profile information.
   */
  update(id: number, user: Partial<User>): Promise<User>;
}
