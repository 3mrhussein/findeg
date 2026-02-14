/**
 * Domain Entity: User
 *
 * Represents a user account with name split into first/last
 * for proper display and address form pre-filling.
 */

export interface User {
  id: number;
  email: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Legacy display name (firstName + lastName fallback) */
  name?: string;
  /** Egyptian phone number (e.g., "+201234567890") */
  phone?: string;
  /** "user" or "admin" */
  role: string;
  image?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
