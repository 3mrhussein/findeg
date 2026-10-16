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

/**
 * Thrown when a requested resource does not exist.
 *
 * App-layer should:
 * - Log the not-found error
 * - Call notFound() to render 404 page, or return 404 JSON response
 * - Display user-friendly message
 *
 * @example
 * const product = await repo.findById(id);
 * if (!product) {
 *   throw new ResourceNotFoundError("Product", id);
 * }
 */
export class ResourceNotFoundError extends DomainError {
  public readonly resourceType: string;
  public readonly identifier: string | number;

  constructor(resourceType: string, identifier: string | number) {
    const message = `${resourceType} with identifier "${String(identifier)}" not found`;
    super('RESOURCE_NOT_FOUND', message, {
      statusCode: 404,
      resourceType,
      identifier,
    });
    this.resourceType = resourceType;
    this.identifier = identifier;
  }

  getClientMessage(): string {
    return 'The requested resource could not be found.';
  }
}

/**
 * Thrown when a single input field fails validation.
 *
 * App-layer should:
 * - Add field-specific error message to form errors
 * - Highlight the invalid field in the UI
 * - Return 400 Bad Request status
 *
 * @example
 * if (!email.includes("@")) {
 *   throw new ValidationError("email", "Email must be valid");
 * }
 */
export class ValidationError extends DomainError {
  public readonly field: string;
  public readonly invalidValue?: unknown;

  constructor(field: string, message: string, invalidValue?: unknown) {
    super('VALIDATION_ERROR', message, {
      statusCode: 400,
      field,
      invalidValue,
    });
    this.field = field;
    this.invalidValue = invalidValue;
  }

  getClientMessage(): string {
    return this.message;
  }
}

/**
 * Thrown when multiple input fields fail validation.
 *
 * App-layer should:
 * - Display all error messages to user
 * - Highlight all invalid fields in the UI
 * - Return 400 Bad Request status
 *
 * @example
 * const errors = [];
 * if (!email.includes("@")) errors.push({ field: "email", message: "Invalid email" });
 * if (password.length < 8) errors.push({ field: "password", message: "Too short" });
 * if (errors.length > 0) throw new ValidationErrors(errors);
 */
export class ValidationErrors extends DomainError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(errors: Array<{ field: string; message: string }>) {
    const fieldNames = errors.map((e) => e.field).join(', ');
    super('VALIDATION_ERRORS', `Validation failed for: ${fieldNames}`, {
      statusCode: 400,
      errors,
    });
    this.errors = errors;
  }

  getClientMessage(): string {
    return 'Please fix the validation errors and try again.';
  }

  /**
   * Get errors grouped by field for form processing.
   * @returns Map of field name to array of error messages
   */
  getErrorsByField(): Map<string, string[]> {
    const map = new Map<string, string[]>();
    for (const error of this.errors) {
      const messages = map.get(error.field) ?? [];
      messages.push(error.message);
      map.set(error.field, messages);
    }
    return map;
  }
}
