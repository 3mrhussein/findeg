import type { DomainError } from "@findeg/backend/features/core";

/**
 * Storefront Error Handler Utilities
 *
 * Translates domain errors thrown by backend services to appropriate
 * user-facing error messages or HTTP responses.
 *
 * Storefront is customer-facing, so errors should be user-friendly
 * and not expose internal implementation details.
 *
 * @example
 * try {
 *   const result = await backend.getProduct(productId);
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   // Display to customer
 * }
 */

/**
 * Extract a user-friendly error message from domain error.
 *
 * @param error - Error thrown by backend service
 * @returns Safe, customer-facing error message
 */
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }

  const domainError = error as DomainError & {
    code?: string;
    getClientMessage?: () => string;
  };

  // Use domain error's client message if available
  if (typeof domainError.getClientMessage === "function") {
    return domainError.getClientMessage();
  }

  // Fallback to generic messages by error code
  switch (domainError.code) {
    case "NOT_AUTHENTICATED":
      return "Please log in to proceed.";

    case "NOT_AUTHORIZED":
      return "You don't have permission for that action.";

    case "RESOURCE_NOT_FOUND":
      return "The requested item could not be found.";

    case "VALIDATION_ERROR":
    case "VALIDATION_ERRORS":
      return "Please check your input and try again.";

    case "CONFLICT_ERROR":
      return "This item already exists.";

    case "BUSINESS_RULE_VIOLATION":
      return domainError.message;

    default:
      try {
        // Don't expose error details to customer
        console.error("[storefront] Domain error:", domainError.code, domainError.message);
      } catch {
        // Ignore logging errors
      }
      return "Something went wrong. Please try again.";
  }
}

/**
 * Get HTTP status code for a domain error.
 *
 * @param error - Domain error
 * @returns HTTP status code (default 500)
 */
export function getStatusCode(error: unknown): number {
  if (!(error instanceof Error)) {
    return 500;
  }

  const domainError = error as DomainError & {
    code?: string;
    metadata?: { statusCode?: number };
    getStatusCode?: () => number;
  };

  // Use domain error's status code if available
  if (typeof domainError.getStatusCode === "function") {
    return domainError.getStatusCode();
  }

  // Check metadata
  if (domainError.metadata?.statusCode) {
    return domainError.metadata.statusCode;
  }

  // Default by code
  switch (domainError.code) {
    case "NOT_AUTHENTICATED":
      return 401;
    case "NOT_AUTHORIZED":
      return 403;
    case "RESOURCE_NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
    case "VALIDATION_ERRORS":
      return 400;
    case "CONFLICT_ERROR":
      return 409;
    case "BUSINESS_RULE_VIOLATION":
      return 422;
    default:
      return 500;
  }
}

/**
 * Type guard to check if error is a domain error.
 *
 * @param error - Error to check
 * @returns true if error is a DomainError subclass
 */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof Error && "code" in error && "metadata" in error;
}
