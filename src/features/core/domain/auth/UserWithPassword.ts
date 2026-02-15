/**
 * User with password hash — only for auth verification.
 *
 * @description Used internally by UserRepository for password verification during login.
 * Never expose this type or the password field to the client.
 */
export interface UserWithPassword {
  id: number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  password: string | null;
}
