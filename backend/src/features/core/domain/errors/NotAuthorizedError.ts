import { DomainError } from './DomainError';

/**
 * Thrown when an authenticated user lacks required permissions for an action.
 *
 * App-layer should:
 * - Log the unauthorized access attempt
 * - Return 403 Forbidden status
 * - Display error message to user
 *
 * @example
 * if (!isAdmin && resource.isPrivate) {
 *   throw new NotAuthorizedError("delete product", "Product #123");
 * }
 */
export class NotAuthorizedError extends DomainError {
  public readonly action: string;
  public readonly resource?: string;

  constructor(action: string, resource?: string) {
    const message = `Not authorized to ${action}${resource ? ` on ${resource}` : ''}`;
    super('NOT_AUTHORIZED', message, {
      statusCode: 403,
      action,
      resource,
    });
    this.action = action;
    this.resource = resource;
  }

  getClientMessage(): string {
    return "You don't have permission to perform this action.";
  }
}
