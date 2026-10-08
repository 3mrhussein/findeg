/**
 * Base class for all domain-specific errors.
 *
 * Provides structured error information for app-layer translation to HTTP responses
 * or Next.js navigation (redirect, notFound).
 *
 * Domain errors are thrown by backend services to signal business rule violations,
 * validation failures, or missing resources. They carry semantic meaning that
 * should be translated to appropriate HTTP responses or user-facing messages.
 *
 * @example
 * throw new NotAuthenticatedError("Session expired");
 *
 * @example
 * try {
 *   const user = await userService.getUser(userId);
 * } catch (error) {
 *   if (error instanceof ResourceNotFoundError) {
 *     return Response.json({ error: "User not found" }, { status: 404 });
 *   }
 * }
 */
export abstract class DomainError extends Error {
  /**
   * Unique error code for programmatic handling.
   * Examples: "NOT_AUTHENTICATED", "RESOURCE_NOT_FOUND", "VALIDATION_ERROR"
   *
   * Used by app-layer to:
   * - Route errors to appropriate handlers
   * - Log errors with context
   * - Translate to user-facing messages
   */
  public readonly code: string;

  /**
   * Additional error context for logging and debugging.
   *
   * Often includes:
   * - statusCode: HTTP status code to return
   * - userId: User ID involved in the error
   * - resourceType: Type of resource not found
   * - field: Which field failed validation
   * - invalidValue: The invalid value provided
   *
   * @example { statusCode: 404, resourceType: "Product", identifier: "123" }
   */
  public readonly metadata?: Record<string, unknown>;

  constructor(code: string, message: string, metadata?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.metadata = metadata;

    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Returns the HTTP status code for this error.
   * Used by app-layer to set response status.
   *
   * @returns HTTP status code (default 500)
   */
  getStatusCode(): number {
    const statusCode = this.metadata?.statusCode;
    return typeof statusCode === 'number' ? statusCode : 500;
  }

  /**
   * Returns a safe error message for the client.
   * Override in subclasses to customize.
   *
   * @returns Error message safe to send to client
   */
  getClientMessage(): string {
    return this.message;
  }

  /**
   * Returns detailed error information for logging.
   *
   * @returns Object with error code, message, and metadata
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      metadata: this.metadata,
    };
  }
}
