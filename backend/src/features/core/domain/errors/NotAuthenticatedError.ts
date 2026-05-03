import { DomainError } from './DomainError';

/**
 * Thrown when a user is not authenticated (no valid session or token).
 *
 * App-layer should:
 * - Log the failed access attempt
 * - Redirect to login page
 * - Return 401 Unauthorized status
 *
 * @example
 * if (!userId) {
 *   throw new NotAuthenticatedError("Session required to view dashboard");
 * }
 */
export class NotAuthenticatedError extends DomainError {
  constructor(message = 'User not authenticated') {
    super('NOT_AUTHENTICATED', message, { statusCode: 401 });
  }

  /**
   * Returns the login page path where unauthenticated users should be redirected.
   * App-layer calls: redirect(error.getRedirectPath())
   *
   * @returns Path to login page
   */
  getRedirectPath(): string {
    return '/login';
  }

  getClientMessage(): string {
    return 'Session expired or invalid. Please log in again.';
  }
}
