/**
 * Domain Error Types
 * 
 * Typed error classes thrown by backend services.
 * App-layer catches these errors and translates to HTTP responses or Next.js navigation.
 */

/**
 * Base class for all domain-specific errors.
 * Provides structured error information for app-layer translation.
 */
export abstract class DomainError extends Error {
  public readonly code: string;
  public readonly metadata?: Record<string, any>;
  
  constructor(code: string, message: string, metadata?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.metadata = metadata;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when user is not authenticated (no valid session).
 * 
 * App-layer translation:
 * - Next.js: redirect(error.getRedirectPath())
 * - API: return 401 JSON response
 */
export class NotAuthenticatedError extends DomainError {
  constructor(message = "User not authenticated") {
    super("NOT_AUTHENTICATED", message, { statusCode: 401 });
  }
  
  getRedirectPath(): string {
    return "/login";
  }
}

/**
 * Thrown when authenticated user lacks required permissions.
 * 
 * App-layer translation:
 * - Next.js: redirect("/403") or display error message
 * - API: return 403 JSON response
 */
export class NotAuthorizedError extends DomainError {
  constructor(action: string, resource?: string) {
    const message = `Not authorized to ${action}${resource ? ` on ${resource}` : ""}`;
    super("NOT_AUTHORIZED", message, { statusCode: 403, action, resource });
  }
}

/**
 * Thrown when requested resource does not exist.
 * 
 * App-layer translation:
 * - Next.js: notFound()
 * - API: return 404 JSON response
 */
export class ResourceNotFoundError extends DomainError {
  constructor(resourceType: string, identifier: string | number) {
    super(
      "RESOURCE_NOT_FOUND",
      `${resourceType} with identifier ${identifier} not found`,
      { statusCode: 404, resourceType, identifier }
    );
  }
}

/**
 * Thrown when input validation fails.
 * 
 * App-layer translation:
 * - Next.js: display field-specific error messages
 * - API: return 400 JSON response with field errors
 */
export class ValidationError extends DomainError {
  constructor(field: string, message: string, invalidValue?: any) {
    super("VALIDATION_ERROR", message, { statusCode: 400, field, invalidValue });
  }
}

/**
 * Thrown when multiple validation errors occur.
 * 
 * App-layer translation:
 * - Next.js: display all errors to user
 * - API: return 400 JSON response with array of field errors
 */
export class ValidationErrors extends DomainError {
  public readonly errors: Array<{ field: string; message: string }>;
  
  constructor(errors: Array<{ field: string; message: string }>) {
    super(
      "VALIDATION_ERRORS",
      `Validation failed: ${errors.map(e => e.field).join(", ")}`,
      { statusCode: 400, errors }
    );
    this.errors = errors;
  }
}

/**
 * Thrown when operation conflicts with current state.
 * 
 * Examples:
 * - Order already shipped, cannot cancel
 * - Email already exists, cannot register
 * 
 * App-layer translation:
 * - Next.js: display error message
 * - API: return 409 JSON response
 */
export class ConflictError extends DomainError {
  constructor(message: string, conflictingResource?: string) {
    super("CONFLICT", message, { statusCode: 409, conflictingResource });
  }
}

/**
 * Thrown when business rule is violated.
 * 
 * Examples:
 * - Cannot ship order with unpaid status
 * - Cannot delete category with active products
 * 
 * App-layer translation:
 * - Next.js: display business rule violation message
 * - API: return 422 JSON response
 */
export class BusinessRuleViolationError extends DomainError {
  constructor(rule: string, message: string) {
    super("BUSINESS_RULE_VIOLATION", message, { statusCode: 422, rule });
  }
}

/**
 * Type guard to check if error is a domain error
 */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

/**
 * Usage Example (Backend Service):
 * 
 * ```typescript
 * export async function getDashboardData(
 *   locale: string,
 *   userId: string | null
 * ): Promise<DashboardData> {
 *   if (!userId) {
 *     throw new NotAuthenticatedError();
 *   }
 * 
 *   const user = await repositories.users.getById(userId);
 *   if (!user) {
 *     throw new ResourceNotFoundError("User", userId);
 *   }
 * 
 *   // ... business logic
 *   return dashboardData;
 * }
 * ```
 * 
 * Usage Example (App-Layer Error Handling):
 * 
 * ```typescript
 * import { redirect, notFound } from "next/navigation";
 * import {
 *   NotAuthenticatedError,
 *   NotAuthorizedError,
 *   ResourceNotFoundError
 * } from "@backend/features/core";
 * 
 * export function handleDomainError(error: unknown): never {
 *   if (error instanceof NotAuthenticatedError) {
 *     redirect(error.getRedirectPath());
 *   }
 *   if (error instanceof NotAuthorizedError) {
 *     redirect("/403");
 *   }
 *   if (error instanceof ResourceNotFoundError) {
 *     notFound();
 *   }
 *   throw error;  // Re-throw for error boundary
 * }
 * 
 * // Usage in Server Component
 * try {
 *   const data = await getDashboardData(locale, session?.userId);
 *   return <DashboardView data={data} />;
 * } catch (error) {
 *   handleDomainError(error);
 * }
 * ```
 */
