/**
 * Session payload stored in JWT.
 *
 * @description Represents the authenticated user's identity in the session token.
 */
export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
}
