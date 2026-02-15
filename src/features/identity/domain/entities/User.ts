/**
 * Domain Entity: User
 *
 * Represents a user account with name split into first/last
 * for proper display and address form pre-filling.
 */

export interface User {
  /** Unique identifier for the user */
  id: number;
  /** Primary contact and login email */
  email: string;
  /** User's given name */
  firstName?: string;
  /** User's family name */
  lastName?: string;
  /** Combined or display name fallback */
  name?: string;
  /** Egyptian mobile number (formatted for SMS/WhatsApp) */
  phone?: string;
  /** Access level control (e.g., 'user', 'admin') */
  role: string;
  /** URL to profile picture */
  image?: string;
  /** Whether the account is active or suspended */
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
