import { ID, Email } from "@/features/core/domain/types/common";
import { UserWithPassword } from "@/features/core/domain/auth";
import { User } from "../../domain/entities/User";

/**
 * User Repository Interface
 *
 * Defines the contract for user data access and profile management.
 */
export interface IUserRepository {
  /**
   * Retrieves a safe user profile by ID (no sensitive data).
   */
  getById(id: ID): Promise<User | null>;

  /**
   * Retrieves a safe user profile by email (no sensitive data).
   */
  getByEmail(email: Email): Promise<User | null>;

  /**
   * Retrieves a user including their hashed password for authentication.
   * INTERNAL USE ONLY.
   */
  getByEmailWithPassword(email: Email): Promise<UserWithPassword | null>;

  /**
   * Persists a new user to storage.
   */
  create(user: Partial<User>): Promise<User>;

  /**
   * Updates an existing user's profile information.
   */
  update(id: ID, user: Partial<User>): Promise<User>;
}
