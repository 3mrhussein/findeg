/**
 * Application Error Classes
 *
 * Standardized error types for consistent error handling across the application.
 * All errors extend AppError base class with status codes for HTTP responses.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 401 Unauthorized - Authentication required or failed
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - User lacks necessary permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

/**
 * 404 Not Found - Requested resource does not exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Not Found") {
    super(message, 404);
  }
}

/**
 * 400 Bad Request - Invalid input data
 */
export class ValidationError extends AppError {
  public readonly errors?: Record<string, string[]>;

  constructor(message: string = "Validation failed", errors?: Record<string, string[]>) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * 409 Conflict - Resource already exists or state conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409);
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error") {
    super(message, 500, false); // Not operational - indicates a bug
  }
}

/**
 * 503 Service Unavailable - External service unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service Unavailable") {
    super(message, 503);
  }
}

/**
 * Helper to check if error is an operational error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}
