/**
 * Backend Library Utilities
 *
 * Re-export all utility functions for easy import.
 * Usage: import { formatCurrency } from '@backend/lib'
 *
 * Note: ValidationError and ConflictError domain errors should be imported from core:
 *       import { ValidationError, ConflictError } from '@backend'
 */

export * from "./i18n";

// Re-export HTTP error classes only (AppError-based)
// Domain errors (ValidationError, ConflictError) come from core
export {
  AppError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  ServiceUnavailableError,
  isOperationalError,
} from "./errors";
